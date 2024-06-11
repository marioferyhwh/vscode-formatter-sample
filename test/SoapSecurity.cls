Class cysnet.bpm.security.SoapSecurity Extends EnsLib.SOAP.Service
{

Parameter SETTINGS = "ComprobarSeguridad,PeticionesAlerta,Bloquear,MinutosNotif,MetodosNoBloq";

/// 0: No comprobar seguridad; 1: Comprobar seguridad
Property ComprobarSeguridad As %Boolean [ InitialExpression = 0 ];

/// Número de peticiones a superar para enviar alerta
Property PeticionesAlerta As %Integer [ InitialExpression = 5 ];

/// 0: No bloquear las peticiones; 1: Bloquear las peticiones entrantes a este servicio
Property Bloquear As %Boolean [ InitialExpression = 0 ];

/// Cada cuántos minutos volver a notificar
Property MinutosNotif As %Integer [ InitialExpression = 15 ];

/// Métodos separados por comas que no se bloquearán nunca
Property MetodosNoBloq As %String(MAXLEN = "");

/// Override: Comprobar que no haya injección SQL. Si la hay, rechazar petición
Method OnAuthorize(pAction, pRequest As %CSP.Request) As %Status
{
	#dim sc As %Status = $$$OK
	#dim content, newContent As %String = ""
	#dim listaContent As %List
	#dim i As %Integer = 0
	
	if (..ComprobarSeguridad) {
		while ('pRequest.AtEnd) {
			set content = content_$ZCONVERT($ZSTRIP(pRequest.ReadLine(),"<>W"),"U")
		}
		
		// Quitar toda tag HTML:
		set regex = ##class(%Regex.Matcher).%New("<[^>]*>")
		do regex.TextSet(content)
		set newContent = regex.ReplaceAll($Char(10))
		
		set listaContent = $lfs(newContent, $Char(10))
		
		// Recorrer cada valor y comprobar:
		for i=1:1:$ll(listaContent) {
			set content = $ZSTRIP($li(listaContent,i),"<>W")
			
			if (content '= "") {
				set sc = ##class(cysnet.bpm.security.Util).checkContent("SOAP", content, pAction, $this)
			}
			
			quit:$$$ISERR(sc)
		}
	}
	
	quit sc
}

}
