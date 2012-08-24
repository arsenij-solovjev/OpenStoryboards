package org.openstoryboards.socketserver.connection.state;

import org.openstoryboards.socketserver.connection.Connection;

public abstract class State {
  public abstract void handleMessage(Connection client, String message);
}
