Class test.msg.ProcesoAlertasRequest Extends Ens.Request
{

Property trazas As list Of cysnet.alertas.msg.struct.Trace;

Storage Default
{
<Data name="ProcesoAlertasRequestDefaultData">
<Subscript>"ProcesoAlertasRequest"</Subscript>
<Value name="1">
<Value>trazas</Value>
</Value>
</Data>
<DefaultData>ProcesoAlertasRequestDefaultData</DefaultData>
<Type>%Storage.Persistent</Type>
}

}
