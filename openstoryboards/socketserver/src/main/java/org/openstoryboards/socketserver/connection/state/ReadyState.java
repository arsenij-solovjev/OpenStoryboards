package org.openstoryboards.socketserver.connection.state;

import org.openstoryboards.socketserver.config.Config; 
import org.openstoryboards.socketserver.connection.Connection;
import org.openstoryboards.socketserver.connection.Session;

import com.google.gson.Gson;
import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.UniformInterfaceException;
import com.sun.jersey.api.client.WebResource;
import com.sun.jersey.core.util.Base64;

public final class ReadyState extends State {
  private static class Error {
	  String type = "ERROR";
	  String message;
	  public Error(String message) {
		  this.message = message;
	  }
  }
	
  @Override
  public void handleMessage(Connection connection, String message) {
	//send message to image service
    Client webClient = new Client();
    WebResource imageService = webClient.resource(Config.IMAGE_APPLY_URL);
    imageService = imageService
    	.queryParam("accessToken", connection.getAccessToken())
    	.queryParam("action", new String(Base64.encode(message)));
    String response = "";
    try {
    	response = imageService.get(String.class);
    } catch(UniformInterfaceException e) {
    	//TODO write a more meaningful message
    	connection.send(new Gson().toJson(new Error("Unable to write action.")));
    	connection.close();
    	return;
    }
	//broadcast response  
	Session session = connection.getSession();
	session.broadcast(response);
  }
  
  private static ReadyState instance;
  
  public synchronized static ReadyState getInstance() {
    if(instance == null) {
      instance = new ReadyState();
    }
    return instance;
  }
}
