Class cysnet.cun.adtbroker.op.HL7BrokerWS Extends cysnet.cun.wc.HL7BrokerWS.bo.BasicHttpBindingIWSHL7Broker
{

Method onADT08WS(pRequest As cysnet.cun.adtbroker.msg.ADT08Request, Output pResponse As cysnet.cun.adtbroker.msg.ADT08Response) As %Status
{
	quit ##class(cysnet.cun.adtbroker.op.core.HL7BrokerWSCore).onADT08(pRequest, .pResponse, $this)
}

Method onADT01WS(pRequest As cysnet.cun.adtbroker.msg.ADT01Request, Output pResponse As cysnet.cun.adtbroker.msg.ADT01Response) As %Status
{
	quit ##class(cysnet.cun.adtbroker.op.core.HL7BrokerWSCore).onADT01(pRequest, .pResponse, $this)
}

Method onADT03WS(pRequest As cysnet.cun.adtbroker.msg.ADT03Request, Output pResponse As cysnet.cun.adtbroker.msg.ADT03Response) As %Status
{
	quit ##class(cysnet.cun.adtbroker.op.core.HL7BrokerWSCore).onADT03(pRequest, .pResponse, $this)
}

Method onObtenerSuscriptoresWS(pRequest As cysnet.cun.adtbroker.msg.ObtenerSuscriptoresRequest, Output pResponse As cysnet.cun.adtbroker.msg.ObtenerSuscriptoresResponse) As %Status
{
	quit ##class(cysnet.cun.adtbroker.op.core.HL7BrokerWSCore).onObtenerSuscriptores(pRequest, .pResponse, $this)
}

Method onSinProcesarWS(pRequest As cysnet.cun.adtbroker.msg.SinProcesarRequest, Output pResponse As cysnet.cun.adtbroker.msg.SinProcesarResponse) As %Status
{
	quit ##class(cysnet.cun.adtbroker.op.core.HL7BrokerWSCore).onSinProcesar(pRequest, .pResponse, $this)
}

Method esProcesoNuevoWS(pRequest As cysnet.cun.adtbroker.msg.EsProcesoNuevoRequest, Output pResponse As cysnet.cun.adtbroker.msg.EsProcesoNuevoResponse) As %Status
{
	quit ##class(cysnet.cun.adtbroker.op.core.HL7BrokerWSCore).esProcesoNuevo(pRequest, .pResponse, $this)
}

Method esPacienteAlergicoWS(pRequest As cysnet.cun.adtbroker.msg.EsPacienteAlergicoRequest, Output pResponse As cysnet.cun.adtbroker.msg.EsPacienteAlergicoResponse) As %Status
{
	quit ##class(cysnet.cun.adtbroker.op.core.HL7BrokerWSCore).esPacienteAlergico(pRequest, .pResponse, $this)
}

Method obtenerAlergiasPacienteWS(pRequest As cysnet.cun.adtbroker.msg.ObtenerAlergiasPacienteRequest, Output pResponse As cysnet.cun.adtbroker.msg.ObtenerAlergiasPacienteResponse) As %Status
{
	quit ##class(cysnet.cun.adtbroker.op.core.HL7BrokerWSCore).obtenerAlergiasPaciente(pRequest, .pResponse, $this)
}

XData MessageMap
{
<MapItems>
	<MapItem MessageType="cysnet.cun.adtbroker.msg.ADT08Request"> 
		<Method>onADT08WS</Method>
	</MapItem>
	<MapItem MessageType="cysnet.cun.adtbroker.msg.ADT01Request"> 
		<Method>onADT01WS</Method>
	</MapItem>
	<MapItem MessageType="cysnet.cun.adtbroker.msg.ADT03Request"> 
		<Method>onADT03WS</Method>
	</MapItem>
    <MapItem MessageType="cysnet.cun.adtbroker.msg.ObtenerSuscriptoresRequest">
        <Method>onObtenerSuscriptoresWS</Method>
    </MapItem>
    <MapItem MessageType="cysnet.cun.adtbroker.msg.SinProcesarRequest"> 
		<Method>onSinProcesarWS</Method>
	</MapItem>
    <MapItem MessageType="cysnet.cun.adtbroker.msg.EsProcesoNuevoRequest"> 
		<Method>esProcesoNuevoWS</Method>
	</MapItem>
	<MapItem MessageType="cysnet.cun.adtbroker.msg.EsPacienteAlergicoRequest"> 
		<Method>esPacienteAlergicoWS</Method>
	</MapItem>
	<MapItem MessageType="cysnet.cun.adtbroker.msg.ObtenerAlergiasPacienteRequest"> 
		<Method>obtenerAlergiasPacienteWS</Method>
	</MapItem>	
 </MapItems>
}

Method obtenerAlergiasPacienteWS(pRequest As cysnet.cun.adtbroker.msg.ObtenerAlergiasPacienteRequest, Output pResponse As cysnet.cun.adtbroker.msg.ObtenerAlergiasPacienteResponse) As %Status
{
	                 quit ##class(cysnet.cun.adtbroker.op.core.HL7BrokerWSCore).obtenerAlergiasPaciente(pRequest, .pResponse, $this)
}

}
