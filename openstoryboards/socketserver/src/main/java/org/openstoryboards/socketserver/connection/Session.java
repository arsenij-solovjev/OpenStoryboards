package org.openstoryboards.socketserver.connection;

import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

public class Session {
  private long padId;
  private Set<Connection> connections = new HashSet<Connection>();
  
  public Session(long padId) {
    this.padId = padId;
  }
  
  public void enter(Connection connection) {
    connections.add(connection);
  }
  
  public void leave(Connection connection) {
    connections.remove(connection);
    connection.setSession(null);
  }
  
  public void broadcast(Connection sender, String message) {
	  for(Connection connection: connections)
		  if(connection!=sender)
			  connection.send(message);
  }
  
  public void broadcast(String message) {
	  for(Connection connection: connections)
		  connection.send(message);
  }

  	private static Map<Long, Session> sessions = new HashMap<Long, Session>();
	public static Session get(long padId) {
	    Session session = sessions.get(padId);
	    if(session==null) {
	    	session = new Session(padId);
	    	sessions.put(padId, session);
	    }
	    return session;
	}
	
	public Collection<Connection> getConnections() {
		return connections;
	}
}
