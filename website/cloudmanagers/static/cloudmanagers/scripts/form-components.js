var FormComponents = function () {

    var handleSelect2 = function () {

        function format(state) {
            var behavior =  state.element;

            //console.log(state);
            if (!state.id) return state.text; // optgroup

            return '<img src="data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" class="x-icon-role-small x-icon-role-small-' + $(behavior).data('behav') + '">&nbsp;&nbsp;' + state.text; 
        }

        $("#select2_role").select2({
            placeholder: "Select a Role",
            allowClear: true,
            formatResult: format,
            formatSelection: format,
            escapeMarkup: function (m) {
                return m;
            }
        });
        $("#select2_role").on("select2-selecting", function(e){
            os = $("#select2_role > option[value="+ e.val +"]").data("os");
            console.log(os);
            $('#role_os').val(os);
            
        })

        
    }


    return {
        //main function to initiate the module
        init: function () {
            handleSelect2();
        }
    };

}();