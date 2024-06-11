/// 
Class test.ProcesoAlertas Extends Ens.BusinessProcessBPL [ ClassType = persistent, ProcedureBlock ]
{

Storage Default
{
<Type>%Storage.Persistent</Type>
}

/// BPL Definition
XData BPL [ XMLNamespace = "http://www.intersystems.com/bpl" ]
{
<process language='objectscript' request='cysnet.alertas.msg.ProcesoAlertasRequest' response='cysnet.alertas.msg.ProcesoAlertasResponse' height='2550' width='2015' >
<context>
<property name='traza' type='cysnet.alertas.msg.struct.Trace' instantiate='0' />
<property name='key' type='%Integer' instantiate='0' />
<property name='keyError' type='%Integer' instantiate='0' />
<property name='error' type='cysnet.alertas.msg.struct.Error' instantiate='0' />
<property name='mensaje' type='%String' instantiate='0' >
<parameters>
<parameter name='MAXLEN'  value='' />
</parameters>
</property>
<property name='mensajeIntegraciones' type='%String' instantiate='0' >
<parameters>
<parameter name='MAXLEN'  value='' />
</parameters>
</property>
<property name='exito' type='%Boolean' instantiate='0' />
<property name='totalTrazas' type='%Integer' initialexpression='1' instantiate='0' />
<property name='mensajeWS' type='%String' instantiate='0' >
<parameters>
<parameter name='MAXLEN'  value='' />
</parameters>
</property>
<property name='sendEmail' type='%Boolean' initialexpression='0' instantiate='0' />
</context>
<sequence xend='200' yend='2200' >
<if name='¿Hay trazas?' condition='( (request.trazas.Count() &gt; 0)&amp;&amp;($ISOBJECT(request.trazas.GetAt(1))) )' xpos='200' ypos='250' xend='200' yend='2100' >
<true>
<code xpos='335' ypos='400' >
<![CDATA[ $$$LOGINFO("Total errores: "_request.trazas.Count())]]>
</code>
<assign name="Resetear sendEmail" property="context.sendEmail" value="0" action="set" xpos='335' ypos='500' />
<foreach name='Recorrer trazas' property='request.trazas' key='context.key' xpos='335' ypos='600' xend='200' yend='1150' >
<assign name="Obtener traza" property="context.traza" value="request.trazas.GetAt(context.key)" action="set" xpos='200' ypos='250' />
<foreach name='Recorrer Errores' property='context.traza.errors' key='context.keyError' xpos='200' ypos='350' xend='200' yend='1650' >
<assign name="Obtener error" property="context.error" value="context.traza.errors.GetAt(context.keyError)" action="set" xpos='200' ypos='250' />
<if name='¿Error Integraciones?' condition='context.error.assignTo = "integraciones"' xpos='200' ypos='350' xend='200' yend='1550' >
<true>
<assign name="Concatenar Mensaje IN" property="context.mensajeIntegraciones" value="context.mensajeIntegraciones_context.error.message_$Char(10)" action="set" xpos='200' ypos='500' />
<if name='¿Hay datos?' condition='$l(context.error.datos) &gt; 1' xpos='200' ypos='600' xend='200' yend='850' >
<true>
<assign name="Concatenar datos a Mensaje IN" property="context.mensajeIntegraciones" value="context.mensajeIntegraciones_context.error.datos_$Char(10)_$Char(10)" action="set" xpos='335' ypos='750' />
</true>
</if>
</true>
<false>
<if name='¿Error WS?' condition='(context.error.assignTo = "error-ws")||(context.error.assignTo = "error-ws-in")' xpos='740' ypos='500' xend='740' yend='1450' >
<annotation><![CDATA[Si assignTo es error-ws ó error-ws-in]]></annotation>
<true>
<assign name="Concatenar Mensaje WS" property="context.mensajeWS" value="context.mensajeWS_context.error.message_&quot; &quot;" action="set" xpos='1280' ypos='650' />
<if name='¿Hay datos?' condition='$l(context.error.datos) &gt; 1' xpos='1280' ypos='750' xend='1280' yend='1000' >
<true>
<assign name="Concatenar datos a Mensaje" property="context.mensajeWS" value="context.mensajeWS_&quot; - &quot;_context.error.datos_&quot;. &quot;" action="set" xpos='1415' ypos='900' />
</true>
</if>
<if name='¿Enviar por email?' condition='context.error.assignTo = "error-ws-in"' xpos='1280' ypos='1100' xend='1280' yend='1350' >
<annotation><![CDATA[Si el assignTo es error-ws-in, enviar también a Integraciones]]></annotation>
<true>
<assign name="Asignar SendEmail" property="context.sendEmail" value="1" action="set" xpos='1415' ypos='1250' />
</true>
</if>
</true>
<false>
<assign name="Concatenar Mensaje" property="context.mensaje" value="context.mensaje_context.error.message_$Char(10)" action="set" xpos='740' ypos='650' />
<if name='¿Hay datos?' condition='$l(context.error.datos) &gt; 1' xpos='740' ypos='750' xend='740' yend='1000' >
<true>
<assign name="Concatenar datos a Mensaje" property="context.mensaje" value="context.mensaje_context.error.datos_$Char(10)_$Char(10)" action="set" xpos='875' ypos='900' />
</true>
</if>
</false>
</if>
</false>
</if>
</foreach>
<if name='¿Hay mensajeIN?' condition='$l(context.mensajeIntegraciones) &gt; 1' xpos='200' ypos='450' xend='200' yend='700' >
<true>
<assign name="Añadir salto línea" property="context.mensajeIntegraciones" value="context.mensajeIntegraciones_$Char(10)" action="set" xpos='335' ypos='600' />
</true>
</if>
<if name='¿Hay mensaje?' condition='$l(context.mensaje) &gt; 1' xpos='200' ypos='800' xend='200' yend='1050' >
<true>
<assign name="Añadir salto línea" property="context.mensaje" value="context.mensaje_$Char(10)" action="set" xpos='335' ypos='950' />
</true>
</if>
</foreach>
<if name='¿Mensaje Integraciones?' condition='context.mensajeIntegraciones &apos;= ""' xpos='335' ypos='700' xend='335' yend='950' >
<true>
<call name='Enviar Alerta Integraciones' target='Ens.Alert' async='1' xpos='470' ypos='850' >
<request type='cysnet.alertas.wc.ServicioAlertas.req.enviarAlertaRequest' >
<assign property="callrequest.mensaje.asunto" value="$Namespace_&quot;: Se han producido errores&quot;" action="set" />
<assign property="callrequest.mensaje.mensaje" value="context.mensajeIntegraciones" action="set" />
<assign property="callrequest.mensaje.destinatario" value="&quot;integraciones&quot;" action="set" />
</request>
<response type='Ens.Response' />
</call>
</true>
</if>
<if name='¿Mensaje?' condition='context.mensaje &apos;= ""' xpos='335' ypos='1050' xend='335' yend='1300' >
<true>
<call name='Enviar Alerta' target='Ens.Alert' async='1' xpos='470' ypos='1200' >
<request type='cysnet.alertas.wc.ServicioAlertas.req.enviarAlertaRequest' >
<assign property="callrequest.mensaje.asunto" value="$Namespace_&quot;: Se han producido errores&quot;" action="set" />
<assign property="callrequest.mensaje.mensaje" value="context.mensaje" action="set" />
</request>
<response type='Ens.Response' />
</call>
</true>
</if>
<if name='¿Mensaje WS?' condition='context.mensajeWS &apos;= ""' xpos='335' ypos='1400' xend='335' yend='2000' >
<true>
<sequence name='Devolver traza' xpos='470' ypos='1550' xend='200' yend='550' >
<assign name="Crear error" property="context.error" value="##class(cysnet.alertas.msg.struct.Error).%New()" action="set" xpos='200' ypos='250' />
<assign name="Error.message" property="context.error.message" value="context.mensajeWS" action="set" xpos='200' ypos='350' />
<assign name="Insert Error" property="response.trace.errors" value="context.error" action="set" key="1" xpos='200' ypos='450' />
</sequence>
<if name='¿Enviar email?' condition='context.sendEmail = 1' xpos='470' ypos='1650' xend='470' yend='1900' >
<true>
<call name='Enviar Alerta Integraciones' target='Ens.Alert' async='1' xpos='605' ypos='1800' >
<request type='cysnet.alertas.wc.ServicioAlertas.req.enviarAlertaRequest' >
<assign property="callrequest.mensaje.asunto" value="$Namespace_&quot;: Se han producido errores&quot;" action="set" />
<assign property="callrequest.mensaje.mensaje" value="context.mensajeWS" action="set" />
<assign property="callrequest.mensaje.destinatario" value="&quot;integraciones&quot;" action="set" />
</request>
<response type='Ens.Response' />
</call>
</true>
</if>
</true>
</if>
</true>
</if>
</sequence>
</process>
}

}
