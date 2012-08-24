package org.openstoryboards.socketserver.connection.state;

import java.util.Collection;

import org.openstoryboards.socketserver.config.Config;
import org.openstoryboards.socketserver.connection.Connection;
import org.openstoryboards.socketserver.connection.Right;
import org.openstoryboards.socketserver.connection.Session;
import org.openstoryboards.socketserver.connection.User;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.JsonPrimitive;
import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.UniformInterfaceException;
import com.sun.jersey.api.client.WebResource;

public final class SynchronizingState extends State {
  
  private static class UserConnection {
	  public UserConnection(Connection conn) {
		  this.connectionId = conn.getConnectionId();
		  User user = conn.getUser();
		  this.userId = user.getId();
		  this.username = user.getName();
		  this.rights = user.getRights();
	  }
	  String type = "LOGIN";
	  long connectionId;
	  long userId;
	  String username;
	  Right[] rights;
  }
	
  @Override
  public void handleMessage(Connection connection, String message) {
	//get ready-to-sync-signal
	if(message.equals(Config.READY_TO_SYNC_SIGNAL)) {
		connection.close(); //wrong signal --> abort
		return;
	}
	
	//enter session --> receive all messages
	Session session = connection.getSession();
	session.enter(connection);

	//send users
	Gson gson = new Gson();
	Collection<Connection> connections = session.getConnections();
	for(Connection it: connections)
		if(it!=connection) {
			UserConnection uc = new UserConnection(it);
			connection.send(gson.toJson(uc));
		}
	
	//send own login to other users
	String loginMessage = gson.toJson(new UserConnection(connection));
	session.broadcast(connection, loginMessage);
	
	//send actions
	Client webClient = new Client();
    WebResource imageService = webClient.resource(Config.ACTIONS_SYNC_URL);
    imageService = imageService
    	.queryParam("accessToken", connection.getAccessToken())
    	.queryParam("fromVersion", Long.toString(connection.getInitialVersion()));
    String actions = "";
    try {
    	actions = imageService.get(String.class);
    } catch(UniformInterfaceException e) {
    	connection.close();
    	return;
    }
    JsonObject response = new JsonObject();
    response.add("type", new JsonPrimitive("SYNC"));
    response.add("actions", new JsonParser().parse(actions));
    connection.send(gson.toJson(response));
    
    //state transistion
    connection.setState(ReadyState.getInstance());
  }
  
  private static SynchronizingState instance;
  
  public synchronized static SynchronizingState getInstance() {
    if(instance == null) {
      instance = new SynchronizingState();
    }
    return instance;
  }
}
