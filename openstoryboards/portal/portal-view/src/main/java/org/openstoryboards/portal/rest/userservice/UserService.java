package org.openstoryboards.portal.rest.userservice;

import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

import javax.ejb.Stateless;
import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.openstoryboards.portal.dao.ConnectionDao;
import org.openstoryboards.portal.dao.PadDao;
import org.openstoryboards.portal.dao.PadHardVersionDao;
import org.openstoryboards.portal.entity.Action;
import org.openstoryboards.portal.entity.Connection;
import org.openstoryboards.portal.entity.Pad;
import org.openstoryboards.portal.entity.PadHardVersion;
import org.openstoryboards.portal.entity.Step;
import org.openstoryboards.portal.entity.User;
import org.openstoryboards.portal.imageprocessor.ImageProcessorServer;
import org.openstoryboards.portal.sessions.SessionRegistry;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.JsonPrimitive;
 

@Path("/users")
@Stateless 
public class UserService {
	
	@Inject 
	private Logger log; 

	@Inject 
	private SessionRegistry sessions;
	
	@Inject 
	private PadDao padDao;
	
	@Inject 
	private ConnectionDao connectionDao;
	
	@Inject 
	private PadHardVersionDao padHardVersionDao;
	
	@Inject
	private ImageProcessorServer imageProcessors;
	
	private Response handshakeError(String message) {
		JsonObject msg = new JsonObject();
		msg.add("status", new JsonPrimitive("ERROR"));
		msg.add("message", new JsonPrimitive(message));
		return Response.ok(
					new Gson().toJson(msg), 
					MediaType.APPLICATION_JSON
				).build();
	}
	
	private JsonObject handshakeResponse(User user, Pad pad,
			PadHardVersion version, Connection connection) {
		JsonParser parser = new JsonParser();
		Gson gson = new Gson();
		//user
		JsonObject jsonUser = new JsonObject();
			jsonUser.add("id", new JsonPrimitive(user.getId()));
			jsonUser.add("name", new JsonPrimitive(user.getUsername()));
			jsonUser.add("rights", gson.toJsonTree(padDao.getRightsFor(user, pad)));
		//connection
		JsonObject jsonConnection = new JsonObject();
			jsonConnection.add("id", new JsonPrimitive(connection.getId()));
			jsonConnection.add("accessToken", new JsonPrimitive(connection.getAccessToken()));
		//pad
		JsonObject jsonPad = new JsonObject();
			jsonPad.add("title", new JsonPrimitive(pad.getTitle()));
		//version
		JsonObject jsonVersion = new JsonObject();
			jsonVersion.add("version", new JsonPrimitive(version.getVersion()));
			//get actions
			Collection<Action> settings = version.getActionSettings();
			JsonArray arraySettings = new JsonArray();
			for(Action a: settings)
				arraySettings.add(parser.parse(a.getAction()));
			jsonVersion.add("actionSettings", arraySettings);
			//get open connections
			Map<Long,User> openConnections = new HashMap<Long, User>();
			JsonArray arrayOpenConnections = new JsonArray();
			for(Action setting: settings) {
				Step step = setting.getStep();
				Connection conn = step.getConnection();
				openConnections.put(conn.getId(), conn.getUser());
			}
			for(Long connId: openConnections.keySet()) {
				User u = openConnections.get(connId);
				JsonObject oc = new JsonObject();
				oc.add("connectionId", new JsonPrimitive(connId));
				oc.add("userId", new JsonPrimitive(u.getId()));
				oc.add("username", new JsonPrimitive(u.getUsername()));
				arrayOpenConnections.add(oc);
			}
			jsonVersion.add("openConnections", arrayOpenConnections);
		//response
		JsonObject jsonResponse = new JsonObject();	
		jsonResponse.add("user", jsonUser);
		jsonResponse.add("connection", jsonConnection);
		jsonResponse.add("pad", jsonPad);
		jsonResponse.add("version", jsonVersion);
		jsonResponse.add("status", new JsonPrimitive("OK"));
		return jsonResponse;
	}
	
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Path("/handshake")
	public Response login(
			@QueryParam(value = "sessionId")String sessionId,
			@QueryParam(value = "padId") long padId){
		log.info("HANDSHAKE: sessionId='" + sessionId + "', padId=" + padId);
		
		//check for user
		User user = sessions.getUserBySessionId(sessionId);
		if(user == null) {
			log.info("HANDSHAKE: user is unknown");
			return handshakeError("Session is unknown.");
		} 
		
		//check for pad
		Pad pad = padDao.find(padId);
		if(pad == null) {
			log.info("HANDSHAKE: pad does not exist");
			return handshakeError("Pad does not exist.");
		}
		
		//check for hard version
		PadHardVersion version = padHardVersionDao.getLastestVersion(pad);
		if(version == null) {
			log.info("HANDSHAKE: pad has no versions.");
			return handshakeError("Pad has no versions.");
		}
		
		//check for connection
		Connection connection = connectionDao.createConnection(user, pad);
		if(connection==null) {
			log.info("HANDSHAKE: user is already logged in");
			return handshakeError("You are already logged in.");
		}	
		
		if(!imageProcessors.login(connection)) {
			log.info("HANDSHAKE: cannot access image processor");
			connectionDao.releaseConnection(connection);
			return handshakeError("cannot access image processor.");
		}

		log.info("LOGIN: user '"+user.getUsername()+"' (user-id="+user.getId()+")");
	
		JsonObject response = handshakeResponse(user, pad, version, connection);
		return  Response.ok(
					new Gson().toJson(response), 
					MediaType.APPLICATION_JSON)
				.build();
	}

	@GET
	@Produces(MediaType.TEXT_PLAIN)
	@Path("/logout")
	public Response logout(@QueryParam(value = "accessToken") String accessToken) {
		Connection connection = connectionDao.getConnection(accessToken);
		if(connection == null)
			return Response.notAcceptable(null).build();
		User user = connection.getUser();
		log.info("LOGOUT: user '"+user.getUsername()+"' (user-id="+user.getId()+")");
		imageProcessors.logout(connection);
		connectionDao.releaseConnection(connection);
		return Response.ok().build();
	}
}