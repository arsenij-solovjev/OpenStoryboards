package org.openstoryboards.socketserver.sockets;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.eclipse.jetty.websocket.WebSocket;
import org.eclipse.jetty.websocket.WebSocket.Connection;
import org.eclipse.jetty.websocket.WebSocketServlet;
import org.openstoryboards.socketserver.sockets.WebSocketChatServlet.ChatWebSocket;

public abstract class WebSocketServer extends WebSocketServlet {
  //--- web server part ---
  private String contextPath;
  
  public WebSocketServer(String contextPath) {
    this.contextPath = contextPath;
  } 
  
  public String getContextPath() {
    return contextPath;
  }
  
  //--- web socket part ---
  
  private WebSocketServer owner = this;
  
  public abstract void onOpen(WebSocketConnection connection);
  public abstract void onClose(WebSocketConnection connection);
  public abstract void onMessage(WebSocketConnection connection, String message);
  
  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response)
      throws javax.servlet.ServletException ,IOException
  {
      getServletContext().getNamedDispatcher("default").forward(request,response);
  };
  
  @Override
  public WebSocket doWebSocketConnect(HttpServletRequest request, String arg1) {
    return new WebSocketClient(request);
  }
  
  private class WebSocketClient implements WebSocket.OnTextMessage {
      private Connection connection;
      private HttpServletRequest request;
      private WebSocketConnection wsc;
      
      public WebSocketClient(HttpServletRequest request) {
        this.request = request;
      }

      public void onOpen(Connection connection) {
          this.connection = connection;
          this.wsc = new WebSocketConnection(request, connection);
          owner.onOpen(this.wsc);
      }
      
      public void onMessage(byte frame, byte[] data,int offset, int length)
      {
          // LOG.info(this+" onMessage: "+TypeUtil.toHexString(data,offset,length));
      }

      public void onMessage(String data) {
        owner.onMessage(this.wsc, data);
      }

      public void onClose(int code, String message) {
        owner.onClose(this.wsc);
      }

  }  
  
}
