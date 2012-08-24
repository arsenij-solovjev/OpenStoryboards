package org.openstoryboards.socketserver.connection;

public class User {
  private long id;
  private String name;
  private Right[] rights;
 
  public User(long id, String name, Right[] rights) {
    this.id = id;
    this.name = name;
    this.rights = rights;
  }
  
  public long getId() { return id; }
  public String getName() { return name; }
  public Right[] getRights() { return rights; }
}