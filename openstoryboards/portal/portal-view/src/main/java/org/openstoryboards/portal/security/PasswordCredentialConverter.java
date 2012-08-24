package org.openstoryboards.portal.security;

import javax.faces.component.UIComponent;
import javax.faces.context.FacesContext;
import javax.faces.convert.Converter;
import javax.faces.convert.FacesConverter;

import org.picketlink.idm.impl.api.PasswordCredential;

@FacesConverter("passwordConverter")
public class PasswordCredentialConverter implements Converter{

	@Override
	public Object getAsObject(FacesContext context, UIComponent component,
			String value) {
		
		return new PasswordCredential(value);
	}

	@Override
	public String getAsString(FacesContext context, UIComponent component,
			Object value) {
		PasswordCredential c = (PasswordCredential) value;
        return value == null ? null:(String)c.getValue();
	}

}
