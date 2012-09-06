package org.openstoryboards.portal.imageprocessor;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.Resource;
import javax.ejb.Stateful;
import javax.inject.Inject;
import javax.naming.Binding;
import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NameClassPair;
import javax.naming.NamingEnumeration;
import javax.naming.NamingException;

import org.openstoryboards.portal.dao.ActionDao;
import org.openstoryboards.portal.dao.PadHardVersionDao;
import org.openstoryboards.portal.entity.Action;
import org.openstoryboards.portal.entity.Connection;
import org.openstoryboards.portal.entity.Pad;
import org.openstoryboards.portal.entity.PadHardVersion;
import org.openstoryboards.portal.entity.Step;
import org.openstoryboards.portal.entity.User;
import org.openstoryboards.portal.entity.enums.ActionType;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.JsonPrimitive;

public class ImageProcessor {

	private long version;
	private Image image = new Image();
	
	public ImageProcessor(Pad pad, DaoCollection daos) {
		//load last version
		PadHardVersion hardVersion = daos.getHardVersonDao().getLastestVersion(pad);
		if(!image.load(hardVersion.getPath()))
			return; //TODO exception?
		version = hardVersion.getVersion();
		
		//apply settings
		for(Action action: hardVersion.getActionSettings())
			;//apply((new JsonParser()).parse(action.getAction()));

		//apply last actions
		for(Action action: daos.getActionDao().getActionList(pad, version))
			;//apply((new JsonParser()).parse(action.getAction()));
	}
	
	/**
	 * annotate, apply, persist action
	 * @param user
	 * @param action
	 * @return
	 */
	public JsonElement receive(Connection connection, JsonElement action) {
		/* POSSIBLE ACTIONS:
		 * {type: "BEGIN", tool: "BRUSH", color: "#000000", size: 10, opacity: 1.0, edge: 1.0}
		 * {type: "BEGIN", tool: "ERASER", size: 10, opacity: 1.0, edge: 1.0}
		 * {type: "BEGIN", tool: "PENCIL", color: "#000000", antiAliased: true, opacity: 1.0}
		 * {type: "STROKE", from: {x: 0, y: 0}, to: {x: 0, y: 0}}
		 * {type: "END"}
		 * {type: "UNDO", targetUserId: 5}
		 * {type: "REDO", targetUserId: 5}
		 * 
		 * NEEDED ANNOTATIONS:
		 * - connectionId
		 * - stepId
		 * - userId
		 * - version
		 */
		try {
			//get details
			JsonObject object = action.getAsJsonObject();
			User user = connection.getUser();
			//annotate action
			object.add("userId", new JsonPrimitive(user.getId()));
			object.add("connectionId", new JsonPrimitive(connection.getId()));
//			apply(action);
		} catch(Exception e) {
			action = error(e.getMessage());//TODO add local action id
		}
		return action;
	}
	
	private JsonElement error(String message) {
		JsonObject object = new JsonObject();
		object.add("type", new JsonPrimitive("ERROR"));
		object.add("message", new JsonPrimitive(message));
		return object;
	}
}
