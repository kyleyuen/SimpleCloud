#!/usr/bin/python
# coding: utf-8
import boto.ec2 as ec2
import qingcloud.iaas


# connect to ec2
def __connect_to_ec2__(token, region):
	return ec2.connect_to_region(
		region, 
		aws_access_key_id=token['access_id'],
		aws_secret_access_key=token['access_key']
	)

def __connect_to_azure__():
	pass

def __connect_to_qingcloud__(token, region):
	return qingcloud.iaas.connect_to_zone(
		str(region),
		str(token['access_id']),
		str(token['access_key'])
	)

class IaaSConnection(object):
	"""docstring for IaaSConnection"""

	def __init__(self, token, provider = 'ec2', region='us-east-1', arg=''):
		super(IaaSConnection, self).__init__()
		self.arg = arg
		self.provider = provider
		self.token = token
		self.region = region

		if provider == "ec2":
			self.conn = __connect_to_ec2__(token, region)
		elif provider == "azure":
			self.conn = __connect_to_azure(token, region)
		elif provider == "qingcloud":
			self.conn = __connect_to_qingcloud__(token, region)
		else:
			self.conn = None

	# call the boto api to buy ondemand type instances
	def __buy_ec2_instances__(self, image_id, instance_info):
		params_dict = {
			"min_count": None, "max_count": None, "key_name": None,
			"security_groups": None, "user_data": None, "addressing_type": None, "instance_type": None,
			"placement": None, "kernel_id": None, "ramdisk_id": None, "monitoring_enabled": None,
			"subnet_id": None, "block_device_map": None, "disable_api_termination": None,
			"instance_initiated_shutdown_behavior": None, "private_ip_address": None, 
			"placement_group": None, "client_token": None, "security_group_ids": None, "additional_info": None,
			"instance_profile_name": None, "instance_profile_arn": None, "tenancy": None,
			"ebs_optimized": None, "network_interfaces": None, "dry_run": None
		}
		params_dict.update(instance_info)

		return self.conn.run_instances(
			image_id, 
			min_count=params_dict['min_count'] or None,
			max_count=params_dict['max_count'] or None,
			key_name=params_dict['key_name'] or None,
			security_groups=params_dict['security_groups'] or None,
			user_data=params_dict['user_data'] or None,
			addressing_type=params_dict['addressing_type'] or None,
			instance_type=params_dict['instance_type'] or None,
			placement=params_dict['placement'] or None,
			kernel_id=params_dict['kernel_id'] or None,
			ramdisk_id=params_dict['ramdisk_id'] or None,
			monitoring_enabled=params_dict['monitoring_enabled'] or False,
			subnet_id=params_dict['subnet_id'] or None,
			block_device_map=params_dict['block_device_map'] or None,
			disable_api_termination=False,
			instance_initiated_shutdown_behavior=params_dict['instance_initiated_shutdown_behavior'] or None,
			private_ip_address=params_dict['private_ip_address'] or None,
			placement_group=params_dict['placement_group'] or None,
			client_token=params_dict['client_token'] or None,
			security_group_ids=params_dict['security_group_ids'] or None,
			additional_info=params_dict['additional_info'] or None,
			instance_profile_name=params_dict['instance_profile_name'] or None,
			instance_profile_arn=params_dict['instance_profile_arn'] or None,
			tenancy=params_dict['tenancy'] or None,
			ebs_optimized=params_dict['ebs_optimized'] or None,
			network_interfaces=params_dict['network_interfaces'] or None,
			dry_run=params_dict['dry_run'] or False
		)

	def __buy_qingcloud__instances__(image_id, instance_info):
		params_dict = {
			"image_id": image_id, "instance_type": None, "cpu": None,
			"memory": None, "count": None, "instance_name": None, "login_mode": None,
			"login_keypair": None, "login_passwd": None, "vxnets.n": None, "security_group": None,
			"volumes.n": None, "need_newsid": None, "need_userdata": None,
			"userdata_type": None, "userdata_value": None, 
			"zone": None
		}
		params_dict.update(instance_info)

		return self.conn.run_instances(
			image_id = params_dict['image_id'] or None, 
			instance_type=params_dict['instance_type'] or None,
			cpu=params_dict['cpu'] or None,
			memory=params_dict['memory'] or None,
			count=params_dict['count'] or 1,
			instance_name=params_dict['instance_name'] or None,
			login_mode=params_dict['login_mode'] or None,
			login_keypair=params_dict['login_keypair'] or None,
			login_passwd=params_dict['login_passwd'] or None,
			security_group=params_dict['security_group'] or None,
			need_newsid=params_dict['need_newsid'] or None,
			need_userdata=params_dict['need_userdata'] or None,
			userdata_type=params_dict['userdata_type'] or None,
			userdata_value=params_dict['userdata_value'] or None,
			zone=params_dict['zone'] or None
		)

	def buy_instances(self, image_id, instance_info, *args, **kwds):
		if self.provider == "ec2":
			print instance_info
			reservation = self.__buy_ec2_instances__(image_id, instance_info)
			return reservation or []
		elif self.provider == "azure":
			pass
		elif self.provider == "qingcloud":
			response = self.__buy_qingcloud__instances__(image_id, instance_info)
		else:
			return None

	def buy_ec2_instance_temporary(self, image_id, instance_type, key_name):
		reservation = self.conn.run_instances(
			image_id,
			key_name=key_name,
			instance_type=instance_type,
			security_groups=['default'])
		return reservation

	def buy_qingcloud_instance_temporary(self, image_id, instance_type, login_passwd):
		response = self.conn.run_instances(
			image_id = image_id,
			instance_type = instance_type,
			login_mode = "passwd",
			login_passwd = login_passwd,
			vxnets = ['vxnet-0'],
			zone = self.region
		)
		return response

	# call the boto api to start a list of isntance
	def start_instances(self, instance_ids):
		if self.provider == "ec2":
			insts = self.conn.start_instances(instance_ids)
		elif self.provider == "qingcloud":
			insts = self.conn.start_instances(instances = [instance_ids])

		return insts or []

	def stop_instances(self, instance_ids):
		if self.provider == "ec2":
			insts = self.conn.stop_instances(instance_ids)
		elif self.provider == "qingcloud":
			insts = self.conn.stop_instances(instances = [instance_ids])

		return insts or []

	def terminate_instances(self, instance_ids):
		if self.provider == "ec2":
			insts = self.conn.terminate_instances(instance_ids)
		elif self.provider == "qingcloud":
			insts = self.conn.terminate_instances(instances = [instance_ids])

		return insts or []

	def reboot_instances(self, instance_ids):
		if self.provider == "ec2":
			insts = self.conn.reboot_instances(instance_ids)
		elif self.provider == "qingcloud":
			insts = self.conn.restart_instances(instances = [instance_ids])

		return insts or []

	def get_all_reservations(self):
		reservation = []
		if self.provider == "ec2":
			regions = self.conn.get_all_regions()
			for region in regions:
				temp_conn = region.connect(aws_access_key_id=self.token['access_id'],aws_secret_access_key=self.token['access_key'])
				temp_reservation = temp_conn.get_all_reservations()
				reservation.extend(temp_reservation)
			return reservation
		elif self.provider == "azure":
			pass
		else:
			return None

	def import_key_pair(self, key_name, public_key_material):
		return self.conn.import_key_pair(key_name, public_key_material)

	def binding_qingcloud_eip(self, bandwidth, eip_name, instance_id, **kwds):
		eip = self.conn.allocate_eips(bandwidth=bandwidth, eip_name=eip_name)

		eip_id = eip["eips"][0]
		self.conn.associate_eip(eip=eip_id, instance=instance_id)
		result = self.conn.describe_eips(instance_id=instance_id)
		address = result["eip_set"][0]["eip_addr"]
		return address