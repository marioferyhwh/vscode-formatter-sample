Include Ensemble

Class cysnet.bpm.security.Util Extends %RegisteredObject
{

ClassMethod checkContent(tipoWS As %String, content As %String, metodo As %String, bs As Ens.BusinessService) As %Status
{
	#dim sc As %Status = $$$OK
	#dim bloquear As %Boolean = 0
	
	// Limpiar contenido de caracteres extraños:
	set content = ..limpiarTexto(content, 1, 1)
	
	// Comprobación básica: quitar los espacios y ver si el texto contiene "OR 1 = 1"
	if ($f($Replace($Replace($ZCONVERT(content,"U")," ",""),"'",""), "OR1=1") > 0) {
		set bloquear = 1
	}
	// Comprobación básica: si contiene print(md5:
	if (($f($ZCONVERT(content,"L"), "print(md5") > 0)||($f($ZCONVERT(content,"L"), "script") > 0)
		||($f($ZCONVERT(content,"L"), "gethostbyname(") > 0)
		||($f($ZCONVERT(content,"L"), "sysdate()") > 0)||($f($ZCONVERT(content,"L"), "now()") > 0)
		||(($f($ZCONVERT(content,"L"), "echo") > 0)&&($f($ZCONVERT(content,"L"), "()") > 0) )
	) {
		set bloquear = 1
	}
	
	/*if (bloquear = 0) {
		// Crear la expresión regular para validar inyección SQL:
		set regex = ##class(%Regex.Matcher).%New("('(''|[^'])*')|(;)|(\b(ALTER|CREATE|DELETE|DROP|EXEC(UTE){0,1}|INSERT( +INTO){0,1}|MERGE|SELECT|UPDATE|UNION( +ALL){0,1})\b)", content)
		// Comprobar si es válido:
		set bloquear = regex.Match()
	}*/
	
	// Si la request contiene ; y alguna expresión SQL, error:
	if (bloquear = 0) {
		if ( (($f(content, ";") > 0)||($f(content, "'") > 0)) && (($f(content, " AND ") > 0)||($f(content, " OR ") > 0)||($f(content, "SELECT ") > 0)||($f(content, "FROM ") > 0)||($f(content, "WHERE ") > 0)||($f(content, "UNION ") > 0)||($f(content, "DROP ") > 0)||($f(content, "DELETE ") > 0)||($f(content, "INSERT ") > 0)||($f(content, "UPDATE ") > 0)) ) {
			set bloquear = 1
		}
	}
	
	// No bloquear los siguientes métodos:
	if ($f(bs.MetodosNoBloq, metodo) > 0) {
		set bloquear = 0
	}
	
	if (bloquear) {
		$$$LOGWARNING(content)
		
		// Contar el nº de intentos en el día:
		if ('$d(^cysnet.security.peticionesSQL(tipoWS, $ZD($H,3), metodo))) {
			set ^cysnet.security.peticionesSQL(tipoWS, $ZD($H,3), metodo) = 0
		}
		set ^cysnet.security.peticionesSQL(tipoWS, $ZD($H,3), metodo) = ^cysnet.security.peticionesSQL(tipoWS, $ZD($H,3), metodo) + 1
		set ^cysnet.security.peticionesSQL(tipoWS, $ZD($H,3), metodo, "info", $ZDT($H,3)) = content
		
		// Si está marcado Bloquear, devolver error:
		if (bs.Bloquear) {
			set sc = $$$ERROR($$$EnsErrGeneral, "Intento de inyeccion SQL")
		}
		
		// Si el nº de peticiones de intento de inyección SQL es igual o superior a PeticionesAlerta, enviar alerta
		if (^cysnet.security.peticionesSQL(tipoWS, $ZD($H,3), metodo) >= bs.PeticionesAlerta) {
			if (..checkSiNotificado(tipoWS, metodo, bs.MinutosNotif) = 0) {
				#dim alertRequest As cysnet.alertas.wc.ServicioAlertas.req.enviarAlertaRequest
				
				set alertRequest = ##class(cysnet.alertas.wc.ServicioAlertas.req.enviarAlertaRequest).%New()
				set alertRequest.mensaje.asunto = $Namespace_": Intento de inyección SQL"
				set alertRequest.mensaje.mensaje = "Se han recibido "_^cysnet.security.peticionesSQL(tipoWS, $ZD($H,3), metodo)_" peticiones en el servicio "_bs.%ConfigName_" con posible inyección SQL en "_metodo
				set alertRequest.mensaje.destinatario = "guardia"
				set alertRequest.mensaje.prioridad = 0
				
				do bs.SendRequestAsync("EnviarAlerta", alertRequest)
			}
		}
	}
	
	quit sc
}

/// Comprueba si, propiedades que deben ser numéricas, lo son:
ClassMethod checkPropiedad(tipoWS As %String, campo As %String, valor As %String, input As %GlobalCharacterStream, metodo As %String, bs As Ens.BusinessService) As %Status
{
	#dim sc As %Status = $$$OK
	#dim bloquear As %Boolean = 0
	
	if ( (campo = "codPersona")||(campo = "codRecurso")||(campo = "codDepartamento")||(campo = "codPersona") ) {
		// Comprobación tipo dato: si es numérico, comprobar que sea número:
		if ( (valor '= "")&&('$IsValidNum(valor)) ) {
			set bloquear = 1
		}
	}
	
	if (bloquear) {
		// Contar el nº de intentos en el día:
		if ('$d(^cysnet.security.peticionesSQL(tipoWS, $ZD($H,3), metodo))) {
			set ^cysnet.security.peticionesSQL(tipoWS, $ZD($H,3), metodo) = 0
		}
		set ^cysnet.security.peticionesSQL(tipoWS, $ZD($H,3), metodo) = ^cysnet.security.peticionesSQL(tipoWS, $ZD($H,3), metodo) + 1
		set ^cysnet.security.peticionesSQL(tipoWS, $ZD($H,3), metodo, "info", $ZDT($H,3)) = input.Read(input.Size)
		
		// Si está marcado Bloquear, devolver error:
		if (bs.Bloquear) {
			set sc = $$$ERROR($$$EnsErrGeneral, "Intento de inyeccion SQL")
		}
		
		// Si el nº de peticiones de intento de inyección SQL es igual o superior a PeticionesAlerta, enviar alerta
		if (^cysnet.security.peticionesSQL(tipoWS, $ZD($H,3), metodo) >= bs.PeticionesAlerta) {
			if (..checkSiNotificado(tipoWS, metodo, bs.MinutosNotif) = 0) {
				#dim alertRequest As cysnet.alertas.wc.ServicioAlertas.req.enviarAlertaRequest
				
				set alertRequest = ##class(cysnet.alertas.wc.ServicioAlertas.req.enviarAlertaRequest).%New()
				set alertRequest.mensaje.asunto = $Namespace_": Intento de inyección SQL"
				set alertRequest.mensaje.mensaje = "Se han recibido "_^cysnet.security.peticionesSQL(tipoWS, $ZD($H,3), metodo)_" peticiones en el servicio "_bs.%ConfigName_" con posible inyección SQL en "_metodo
				set alertRequest.mensaje.destinatario = "guardia"
				set alertRequest.mensaje.prioridad = 0
				
				do bs.SendRequestAsync("EnviarAlerta", alertRequest)
			}
		}
	}
	
	quit sc
}

/// Comprueba si se ha enviado alerta
ClassMethod checkSiNotificado(tipoWS As %String, metodo As %String, minutosNotif As %Integer) As %Boolean
{
	#dim notificado As %Boolean = 0
	#dim hora As %Integer = $SYSTEM.SQL.DATEPART("hh", $ZDT($H,3))
	
	// Comprobar si se ha notificado el evento en esta hora:
	if ($d(^cysnet.security.notificaciones(tipoWS, $ZD($H,3), metodo))) {
		// Si exite, comprobar cuánto hace de la última notificación:
		if ($SYSTEM.SQL.DATEDIFF("mi", ^cysnet.security.notificaciones(tipoWS, $ZD($H,3), metodo), $ZDT($H,3)) <= minutosNotif) {
			$$$LOGASSERT("Alerta sobre "_metodo_" ya enviada")
			set notificado = 1
		} else {
			// Si ha pasado minutosNotif, actualizar la fecha, y permitir el envío:
			set ^cysnet.security.notificaciones(tipoWS, $ZD($H,3), metodo) = $ZDT($H,3)
		}
	} else {
		// Si no existe, crearla:
		set ^cysnet.security.notificaciones(tipoWS, $ZD($H,3), metodo) = $ZDT($H,3)
		set ^cysnet.security.notificaciones(tipoWS, $ZD($H,3), hora, metodo) = 1
	}
	
	quit notificado
}

/// Quitar del texto todos aquellos caracteres que no son válidos:
ClassMethod limpiarTexto(texto As %String, incluirTabs As %Boolean = 0, incluirSaltosLinea As %Boolean = 0) As %String
{
	#dim i As %Integer = 0
	
	// Códigos ASCII del 0 al 8
	for i=0:1:8 {
		set texto = $Replace(texto, $Char(i), "")
	}
	if (incluirTabs) {
		// Código ASCII 9 (tabulador horizontal)
		set texto = $Replace(texto, $Char(9), "")
	}
	if (incluirSaltosLinea) {
		// Código ASCII 10 (salto de línea)
		set texto = $Replace(texto, $Char(10), "")
		// Código ASCII 13 (retorno de carro)
		set texto = $Replace(texto, $Char(13), "")
	}
	// Código ASCII 11 (tabulador vertical)
	set texto = $Replace(texto, $Char(11), "")
	// Código ASCII 12 (salto de página)
	set texto = $Replace(texto, $Char(12), "")
	// Códigos ASCII del 14 al 31
	for i=14:1:31 {
		set texto = $Replace(texto, $Char(i), "")
	}
	
	quit texto
}

}
