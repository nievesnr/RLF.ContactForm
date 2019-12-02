sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, JSONModel) {
	"use strict";

	return Controller.extend("ContactForm.ContactForm.controller.View1", {
		
	onInit: function () {
			var oModel = new JSONModel();
			oModel.loadData(sap.ui.require.toUrl("ContactForm/ContactForm/model/contactModel.json"));
			this.getView().setModel(oModel);
	},
		
		//Se asegura de que las peticiones vengan de nuestro dominio
		_fetchToken: function() {
			var token;
			$.ajax({
				url: "/bpmworkflowruntime/rest/v1/xsrf-token",
				method: "GET",
				async: false,
				headers: {
					"X-CSRF-Token": "Fetch"
				},
				success: function (result, xhr, data) {
					token = data.getResponseHeader("X-CSRF-Token");
				}
			});
			return token;
		},
		
		//Llama al servicio workflow para generar una instancia
		_startInstance: function (token) {
			
			var oModel = this.getView().getModel();
			var nombreUserInputValue = oModel.getProperty("/NombreUser");
			var apellidosUserInputValue = oModel.getProperty("/ApellidosUser");
			var userMailInputValue = oModel.getProperty("/UserMail");
			var motivoContactoSelectValue = oModel.getProperty("/MotivoContacto");
			var textExpTextAreaValue = oModel.getProperty("/TextExp");
			
			$.ajax({
				url: "/bpmworkflowruntime/rest/v1/workflow-instances",
				method: "POST",
				async: false,
				contentType: "application/json",
				headers: {
					"X-CSRF-Token": token
				},
				data: JSON.stringify({
					"definitionId": "wfcontactform",
					"context": {
						"NombreUser": nombreUserInputValue,
						"ApellidosUser": apellidosUserInputValue,
						"UserMail": userMailInputValue,
						"MotivoContacto": motivoContactoSelectValue,
						"TextExp": textExpTextAreaValue
					}
				}),
				success: function (result, xhr, data){
					oModel.setProperty("/result", JSON.stringify(result, null, 4));
					
					if(result.status === "RUNNING"){
						MessageToast.show("Tu mensaje ha sido enviado correctamente");
					}else{
						MessageToast.show("No se ha podido enviar tu mensaje");
					}
				}
			});
		},
		
		onSendPress: function (oEvent){
			
			var token = this._fetchToken();
			this._startInstance(token);
		}
	});
});