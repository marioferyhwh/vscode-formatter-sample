/// 
Class test.rules.AlertRule Extends Ens.Rule.Definition
{

Parameter RuleAssistClass = "EnsLib.MsgRouter.RuleAssist";

XData RuleDefinition [ XMLNamespace = "http://www.intersystems.com/rule" ]
{
<ruleDefinition alias="" context="EnsLib.MsgRouter.RoutingEngine" production="cysnet.AlertasProd">
<ruleSet name="Comprobar a quién enviar la alerta" effectiveBegin="" effectiveEnd="">
<rule name="Email alerta personalizada" disabled="false">
<constraint name="msgClass" value="cysnet.alertas.wc.ServicioAlertas.req.enviarAlertaRequest"></constraint>
<when condition="1">
<send transform="" target="EnviarAlerta"></send>
<return></return>
</when>
</rule>
<rule name="Email Alert Error" disabled="false">
<constraint name="msgClass" value="Ens.AlertRequest"></constraint>
<when condition="1">
<send transform="" target="EnviarAlerta"></send>
<return></return>
</when>
</rule>
</ruleSet>
</ruleDefinition>
}

}
