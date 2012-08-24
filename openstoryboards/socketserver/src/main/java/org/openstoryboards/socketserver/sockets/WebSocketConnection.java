package org.openstoryboards.socketserver.sockets;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import org.eclipse.jetty.websocket.WebSocket.Connection;

public class WebSocketConnection {

  private HttpServletRequest request;
  private Connection connection;
  
  public WebSocketConnection(HttpServletRequest request, Connection connection) {
    this.connection = connection;
    this.request = request;
  }

  public void sendMessage(String message) {
    try {
      this.connection.sendMessage(message);
    } catch (IOException e) {
      // TODO throw error?
    }
  }
  
  public HttpServletRequest getRequest() {
    return this.request;
  }

  public void close() {
    connection.close();
  }
}
