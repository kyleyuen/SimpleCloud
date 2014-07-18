from django.shortcuts import render
from django.http import HttpResponse, HttpResponseBadRequest
import json
import pprint

from benchmark.models import *

def index(request):
	return render(request, 'application/index.html')

def deploy(request):
	return render(request, 'application/deploy.html')

def search(request):
	if request.method == 'GET':
		os = request.GET.get('os')
		vcpu = request.GET.get('vcpu')
		vram = request.GET.get('vram')
		storage = request.GET.get('storage')

		if (not os) or (not vcpu) or (not vram):
			return HttpResponseBadRequest()

		# query virtual machine's info from database by given condition
		queryResult = InstanceType.objects.filter(os_type = str(os),
											vcpu = int(vcpu),
											vram__range = [float(vram) - 1, float(vram) + 1])
		queryResult = InstanceType.objects.filterPlausibleInstanceType(queryResult)

		# fill up responseData in json format and return
		responseData = {}
		
		responseData["rsm"] = { "Instances" : {}, "Performance" : {} }

		# set error flag if query result is empty
		if len(queryResult) == 0:
			responseData["errno"] = -1
			responseData["err"] = "no query data"
			return HttpResponse(json.dumps(responseData), content_type="application/json")

		# just return first ten results to display
		if len(queryResult) > 10:
			queryResult = queryResult[:10]

		for instance in queryResult:
			responseData["rsm"]["Instances"][instance.id] = instance.getDetailsUgly()

		responseData["rsm"]["Performance"] = parsePerformanceInfo(queryResult)
		responseData["errno"] = 1

		return HttpResponse(json.dumps(responseData), content_type="application/json")
	else:
		return HttpResponseBadRequest()


# extract performance info from all instances
def parsePerformanceInfo(queryResult):
	info = {}

	# receive unixbench result info
	info["unixbench"] = parseUnixBenchResult(queryResult)

	return info

# extract unixbench result from all instances
def parseUnixBenchResult(queryResult):
	result = { "series": {}, "average": {} }
	
	result["name"] = "unixbench"
	result["description"] = ""
	result["scale"] = "Score"
	result["os"] = "linux"

	for instance in queryResult:
		result["series"][instance.id] = str(UnixBench.objects.getRecordsByInstanceType(instance))
		result["average"][instance.id] = str(UnixBench.objects.averageScore(instance))
	return result