package org.openstoryboards.socketserver.connection;

import org.openstoryboards.socketserver.config.Config;
import org.openstoryboards.socketserver.connection.state.SessionUnknownState;
import org.openstoryboards.socketserver.connection.state.State;
import org.openstoryboards.socketserver.sockets.WebSocketConnection;

import com.google.gson.Gson;
import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.UniformInterfaceException;
import com.sun.jersey.api.client.WebResource;

public class Connection {  
	private static class UserConnection {
		String type = "LOGOUT";
		long connectionId;
		long userId;
		public UserConnection(Connection conn) {
			this.connectionId = conn.getConnectionId();
			this.userId = conn.getUser().getId();
		}
	}
	
  private WebSocketConnection connection;
  private Session session = null;
  private User user = null;
  private State state = SessionUnknownState.getInstance();
  private String accessToken = "";
  private long initialVersion = 0;
  private long connectionId;
  
  public Connection(WebSocketConnection connection) {
    this.connection = connection;
  }
  
  public void close() {
	  if(session!=null) {
		  session.broadcast(this, new Gson().toJson(new UserConnection(this)));
		  session.leave(this);
	  }
	  logout();
  }
  
  private void logout() {
	  Client webClient = new Client();
	  WebResource userService = webClient.resource(Config.LOGOUT_URL);
	  userService = userService.queryParam("accessToken", this.accessToken);
	  try {
		  userService.get(String.class);
	  } catch(UniformInterfaceException e) {
		  System.out.println("LOGOUT failed ("+userService.getURI()+")");
	  }
  }

  public void receive(String message) {
	state.handleMessage(this, message);
  }
  
  public void send(String message) {
	connection.sendMessage(message);
  }
  
  public void setState(State state) {
    this.state = state;
  }
  
  public WebSocketConnection getConnection() {
    return connection; 
  }

  public void setSession(Session session) {
    this.session = session;
  }

  public void setUser(User user) {
    this.user = user;    
  }

  public void setInitialVersion(long version) {
	this.initialVersion = version;
  }

	public String getAccessToken() {
		return this.accessToken;
	}
	
	public void setConnectionDetails(long id, String accessToken) {
		this.connectionId = id;
		this.accessToken = accessToken;
	}

	public Session getSession() {
		return session;
	}

	public long getConnectionId() {
		return connectionId;
	}
	
	public User getUser() {
		return user;
	}

	public long getInitialVersion() {
		return initialVersion;
	}
}
