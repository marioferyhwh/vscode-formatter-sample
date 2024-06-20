Class test.EnviarAlerta Extends (cysnet.bpm.bo.SoapBusinessOperation, cysnet.alertas.wc.ServicioAlertas.bo.ServicioAlertasSoap)
{

Parameter SETTINGS = "Remitente,Destinatario,EmailIntegraciones,EmailGuardia,EmailCustom";

/// Email remitente
Property Remitente As %String(MAXLEN = "");

/// Email al que enviar las alertas
Property Destinatario As %String(MAXLEN = "");

/// Email integraciones
Property EmailIntegraciones As %String(MAXLEN = "");

/// Email guardia
Property EmailGuardia As %String(MAXLEN = "");

/// Email custom
Property EmailCustom As %String(MAXLEN = "");

Method enviarAlertaWS(pRequest As cysnet.alertas.wc.ServicioAlertas.req.enviarAlertaRequest, Output pResponse As cysnet.alertas.wc.ServicioAlertas.rsp.enviarAlertaResponse) As %Status
{
	set pRequest.entorno.namespace = $Namespace
	set pRequest.entorno.produccion = $get($$$EnsRuntime("Name"))
	set pRequest.entorno.instancia = ##class(%SYS.System).GetInstanceName()
	set pRequest.entorno.nodo = ##class(%SYS.System).GetNodeName()
	set pRequest.entorno.hora = $ZDT($H,3)
	
	if (pRequest.mensaje.destinatario = "integraciones") {
		set pRequest.mensaje.destinatario = ..EmailIntegraciones
	}
	if (pRequest.mensaje.destinatario = "guardia") {
		set pRequest.mensaje.destinatario = ..EmailGuardia
	}
	if (pRequest.mensaje.destinatario = "custom") {
		set pRequest.mensaje.destinatario = ..EmailCustom
	}
	if (pRequest.mensaje.destinatario = "") {
		set pRequest.mensaje.destinatario = ..Destinatario
	}
	if (pRequest.mensaje.remitente = "") {
		set pRequest.mensaje.remitente = ..Remitente
	}
	
	if (pRequest.mensaje.destinatario = "no-enviar") {
		$$$LOGINFO("No enviar mensaje. Destinatario = no-enviar")
		quit $$$OK
	} else {
		set pRequest.mensaje.mensaje = ..limpiarMensaje(pRequest.mensaje.mensaje)
		
		quit ..enviarAlerta(pRequest, .pResponse)
	}
}

Method enviarAlertaErrorWS(pRequest As Ens.AlertRequest, Output pResponse As Ens.Response) As %Status
{
	set req = ##class(cysnet.alertas.wc.ServicioAlertas.req.enviarAlertaErrorRequest).%New()
	set req.entorno.namespace = $Namespace
	set req.entorno.produccion = $get($$$EnsRuntime("Name"))
	set req.entorno.instancia = ##class(%SYS.System).GetInstanceName()
	set req.entorno.nodo = ##class(%SYS.System).GetNodeName()
	set req.entorno.hora = $ZDT($H,3)
	set req.mensaje.destinatario = ..Destinatario
	set req.mensaje.remitente = ..Remitente
	set req.errorAlert.SourceConfigName = pRequest.SourceConfigName
	set req.errorAlert.AlertText = pRequest.AlertText
	set req.errorAlert.AlertDestination = pRequest.AlertDestination
	set req.errorAlert.AlertTime = pRequest.AlertTime
	set req.errorAlert.SessionId = pRequest.SessionId
	
	set req.errorAlert.AlertText = ..limpiarMensaje(req.errorAlert.AlertText)
	
	quit ..enviarAlertaError(req, .pResponse)
}

/// Quitar del mensaje todos aquellos caracteres que no son válidos:
ClassMethod limpiarMensaje(texto As %String) As %String
{
	#dim i As %Integer = 0
	
	// Códigos ASCII del 0 al 8
	for i=0:1:8 {
		set texto = $Replace(texto, $Char(i), "")
	}
	// Código ASCII 11
	set texto = $Replace(texto, $Char(11), "")
	// Código ASCII 12
	set texto = $Replace(texto, $Char(12), "")
	// Códigos ASCII del 14 al 31
	for i=14:1:31 {
		set texto = $Replace(texto, $Char(i), "")
	}
	
	quit texto
}

/* ------------------ Métodos para el control de envío de alertas de error ------------------ */
/// Override this method to provide custom error handling. Return 0 means skip standard AlertOnError behavior.
Method OnError(ByRef pStatus As %Status) As %Boolean
{
	//$$$LOGWARNING("Errooooor")
	// Devolver 0 para que no salte alerta. La alerta saltará en OnFailureTimeout
	Quit 0
}

/// Override this method to provide custom handling of retry / failure timeout.<p/>
/// Set ..Retry=1 to override normal error return and re-evaluate flag properties.<p/>
/// Return 0 to skip further (default) FailureTimeout processing, 1 to perform default processing.
Method OnFailureTimeout(pRequest As %Library.Persistent, Output pResponse As %Library.Persistent, ByRef pSC As %Status) As %Boolean
{
	//$$$LOGALERT("Timeouuuuut")
	// Enviar la alerta solo en este punto y si está activo Alerta si error:
	if (..AlertOnError) {
		do ..SendAlert(##class(Ens.AlertRequest).%New($LB(..%ConfigName,$$$StatusDisplayString(pSC))))
	}
	
	quit 1
}

/* ---------------- FIN Métodos para el control de envío de alertas de error ---------------- */
XData MessageMap
{
<MapItems>
	<MapItem MessageType="cysnet.alertas.wc.ServicioAlertas.req.enviarAlertaRequest"> 
		<Method>enviarAlertaWS</Method>
	</MapItem>
	<MapItem MessageType="Ens.AlertRequest"> 
		<Method>enviarAlertaErrorWS</Method>
	</MapItem>
</MapItems>
}

}
