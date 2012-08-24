package org.openstoryboards.socketserver.sockets.impl;

import java.util.HashMap;
import java.util.Map;

import org.openstoryboards.socketserver.connection.Connection;
import org.openstoryboards.socketserver.sockets.WebSocketConnection;
import org.openstoryboards.socketserver.sockets.WebSocketServer;

public class PadServer extends WebSocketServer {
  private static final long serialVersionUID = 5728095442411493976L;
  
  private Map<WebSocketConnection, Connection> connections = new HashMap<WebSocketConnection, Connection>();

  public PadServer(String contextPath) {
    super(contextPath);
  }
  
  @Override
  public void onOpen(WebSocketConnection wsconn) {
    Connection connection = new Connection(wsconn);
    connections.put(wsconn, connection);
  }

  @Override
  public void onClose(WebSocketConnection wsconn) {
    Connection connection = connections.get(wsconn);
    connection.close();
	connections.remove(wsconn);
  }

  @Override
  public void onMessage(WebSocketConnection wsconn, String message) {
    Connection connection = connections.get(wsconn);
    connection.receive(message);
  }
}