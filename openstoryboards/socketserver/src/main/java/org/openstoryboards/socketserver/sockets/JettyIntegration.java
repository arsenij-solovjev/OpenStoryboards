/*
 * Copyright (c) 2012 Andrej Golovnin. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *  o Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 *
 *  o Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 *  o Neither the name of Andrej Golovnin nor the names of
 *    its contributors may be used to endorse or promote products derived
 *    from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
 * OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

package org.openstoryboards.socketserver.sockets;

import java.lang.management.ManagementFactory;  
import java.util.LinkedList;
import java.util.List;

import javax.management.MBeanServer;
import javax.management.ObjectName;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import org.eclipse.jetty.server.Handler;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.handler.ContextHandlerCollection;
import org.eclipse.jetty.server.nio.SelectChannelConnector;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.servlet.ServletHolder;
import org.openstoryboards.socketserver.sockets.impl.PadServer;

public final class JettyIntegration implements ServletContextListener {
    private static final int WEBSOCKET_SERVER_PORT = 8181;
    private Server server;
    
    private List<WebSocketServer> webSocketServers = new LinkedList<WebSocketServer>() {{
      add(new PadServer("/sketchpad"));
    }}; 

    public void contextInitialized(ServletContextEvent sce) {      
        String jbossWebHost;
        Integer jbossWebPort;
        
        MBeanServer mBeanServer = ManagementFactory.getPlatformMBeanServer();
        try {
            ObjectName http =
                new ObjectName("jboss.as:socket-binding-group=standard" +
                            "-sockets,socket-binding=http");
            jbossWebHost =
                (String) mBeanServer.getAttribute(http, "boundAddress");
            jbossWebPort = (Integer) mBeanServer.getAttribute(http, "boundPort"); 
        } catch (Exception e) {
            throw new Error(e);
        }

        //setup server
        server = new Server();
        SelectChannelConnector connector = new SelectChannelConnector();
        connector.setHost(jbossWebHost);
        connector.setPort(WEBSOCKET_SERVER_PORT);
        server.addConnector(connector);

        //create handlers for websocket servers
        Handler[] handlers = new Handler[webSocketServers.size()];
        int i = 0;
        for(WebSocketServer wss: webSocketServers) {
          ServletContextHandler ws = new ServletContextHandler(
              ServletContextHandler.SESSIONS);
          ws.setContextPath(wss.getContextPath());
          ws.addServlet(new ServletHolder(wss), "/*");
          ws.setAllowNullPathInfo(true);
          handlers[i++] = ws;
        }
        ContextHandlerCollection contexts = new ContextHandlerCollection();
        contexts.setHandlers(handlers);
        server.setHandler(contexts);

        //start server
        try {
            server.start();
        } catch (Exception e) {
            sce.getServletContext().log(
                "An error occurred while starting Jetty", e);
        }
    }

    public void contextDestroyed(ServletContextEvent sce) {
        //stop server
        if (server != null) {
            try {
                server.stop();
            } catch (Exception e) {
                sce.getServletContext().log(
                    "An error occurred while shutting down Jetty", e);
            }
        }
    }
}