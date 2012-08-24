package org.openstoryboards.socketserver.connection.state;

import org.openstoryboards.socketserver.config.Config;
import org.openstoryboards.socketserver.connection.Connection;
import org.openstoryboards.socketserver.connection.Right;
import org.openstoryboards.socketserver.connection.Session;

import com.google.gson.Gson;
import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.WebResource;

public final class SessionUnknownState extends State {
  private static class HandshakeRequest {
    long padId;
    String sessionId;
  }
  
  private static class HandshakeResponse {
	enum Status {
		OK, ERROR
	}
	Status status;

	private static class User {
		long id;
		String name;
		Right[] rights;
	}
	
	private static class Connection {
		long id;
		String accessToken;
	}
	
	private static class Version {
		long version;
	}
	
	User user = new User();
	Connection connection = new Connection();
	Version version = new Version();
	String message;
  }
  
  private String handshake(HandshakeRequest req) {
    Client webClient = new Client();
    WebResource userService = webClient.resource(Config.HANDSHAKE_URL);
    userService = userService
    	.queryParam("sessionId", req.sessionId!=null ? req.sessionId : "")
    	.queryParam("padId", Long.toString(req.padId));
    return userService.get(String.class);
  }
  
  @Override
  public void handleMessage(Connection connection, String message) {
	HandshakeRequest req = (new Gson()).fromJson(message, HandshakeRequest.class);
    String respStr = handshake(req);
    HandshakeResponse resp = new Gson().fromJson(respStr, HandshakeResponse.class);
    if(resp.status == HandshakeResponse.Status.OK) {
    	//set connection settings
    	Session session = Session.get(req.padId);
        connection.setUser(new org.openstoryboards.socketserver.connection.User(resp.user.id, resp.user.name, resp.user.rights));
        connection.setConnectionDetails(resp.connection.id, resp.connection.accessToken);
        connection.setInitialVersion(resp.version.version);
        connection.setSession(session); //only set session, do not enter it now
        //change state
    	connection.setState(SynchronizingState.getInstance());
    	//send response
    	connection.send(respStr);
    } else { //a handshake error occurred
    	connection.send(respStr);
    	connection.getConnection().close();
    }
  }
  
  private static SessionUnknownState instance;
  
  public synchronized static SessionUnknownState getInstance() {
    if(instance == null) {
      instance = new SessionUnknownState();
    }
    return instance;
  }
}
