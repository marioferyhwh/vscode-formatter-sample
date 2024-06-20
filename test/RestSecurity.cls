Class cysnet.bpm.security.RestSecurity Extends EnsLib.REST.Service
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

/// Comprobar que no haya injección SQL. Si la hay, rechazar petición
Method CheckSecurity(metodo As %String, input As %AbstractStream, params As %ListOfObjects, headerParams As %ListOfObjects) As %Status
{
	#dim sc As %Status = $$$OK
	#dim i As %Integer
	#dim campoValor As cysnet.bpm.msg.struct.CampoValor
	#dim content, campo, valor As %String = ""
	#dim obj = ""
	
	if (..ComprobarSeguridad) {
		$$$LOGWARNING("Comprobar seguridad "_metodo)
		
		if (params '= "") {
			for i=1:1:params.Count() {
				set campoValor = params.GetAt(i)
				set sc = ##class(cysnet.bpm.security.Util).checkContent("REST", campoValor.campo, metodo, $this)
				if ($$$ISOK(sc)) {
					set sc = ##class(cysnet.bpm.security.Util).checkContent("REST", campoValor.valor, metodo, $this)
				}
				quit:$$$ISERR(sc)
			}
		}
		
		if (headerParams '= "") {
			for i=1:1:headerParams.Count() {
				set campoValor = headerParams.GetAt(i)
				set sc = ##class(cysnet.bpm.security.Util).checkContent("REST", campoValor.campo, metodo, $this)
				if ($$$ISOK(sc)) {
					set sc = ##class(cysnet.bpm.security.Util).checkContent("REST", campoValor.valor, metodo, $this)
				}
				quit:$$$ISERR(sc)
			}
		}
		
		if ( ($$$ISOK(sc))&&(input.Size > 0) ) {
			do input.Rewind()
			
			// Convertir input a objeto
			set sc = ##class(cysnet.rest.util.JsonProvider).JSONStreamToObject(input, .obj)
			
			// Si es un error 5001 (se esperaba un { al comienzo del JSON)
			if ($System.Status.GetErrorCodes(sc) = 5001) {
				// Error, no es JSON. Probar a convertir QueryString a JSON
				do input.Rewind()
				set newJson = ##class(cysnet.bpm.util.Util).convertQueryString(input.Read(input.Size))
				set sc = ##class(cysnet.rest.util.JsonProvider).JSONStreamToObject(newJson, .obj)
			}
			
			if ($$$ISOK(sc)) {
				set sc = ..recorrerPropiedades(obj, metodo, input, $this)
			} else {
				$$$LOGERROR($System.Status.GetErrorText(sc))
				
				// Poner sc a OK para que la petición entre y no bloquearlas sin saber si están bien o mal:
				set sc = $$$OK
			}
		}
	}
		
	quit sc
}

ClassMethod recorrerPropiedades(obj As %RegisteredObject, metodo As %String, input As %AbstractStream, bs As Ens.BusinessService) As %Status
{
	#dim sc As %Status = $$$OK
	#dim campo, valor As %String = ""
	#dim i As %Integer
	
	// Recorrer las propiedades y comprobar cada una:
	set campo = ""
	for {
		set campo = $Order(obj.%data(campo),1)
		quit:campo=""
		
		//$$$LOGINFO(campo_" = "_obj.%data(campo))
		
		if ($IsObject(obj.%data(campo))) {
			if ($ClassName(obj.%data(campo)) = "%Library.ListOfObjects") {
				for i=1:1:obj.%data(campo).Count() {
					set sc = ..recorrerPropiedades(obj.%data(campo).Oref(i), metodo, input, bs)
					quit:$$$ISERR(sc)
				}
				
			} elseif ($ClassName(obj.%data(campo)) = "%ZEN.proxyObject") {
				set sc = ..recorrerPropiedades(obj.%data(campo), metodo, input, bs)
				
			} else {
				$$$LOGWARNING("No sé qué hacer: "_$ClassName(obj.%data(campo))_" - "_obj.%data(campo))
			}
			
		} else {
			// Comprobar el campo:
			set sc = ##class(cysnet.bpm.security.Util).checkContent("REST", campo, metodo, bs)
			if ($$$ISOK(sc)) {
				// Comprobar el valor:
				set sc = ##class(cysnet.bpm.security.Util).checkContent("REST", obj.%data(campo), metodo, bs)
			}
			if ($$$ISOK(sc)) {
				// Comprobar el valor:
				set sc = ##class(cysnet.bpm.security.Util).checkPropiedad("REST", campo, obj.%data(campo), input, metodo, bs)
			}
		}
		
		quit:$$$ISERR(sc)
	}
	
	quit sc
}

}
