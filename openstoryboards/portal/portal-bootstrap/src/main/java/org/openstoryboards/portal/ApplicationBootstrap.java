package org.openstoryboards.portal;

import java.util.logging.Logger;

import javax.annotation.PostConstruct;
import javax.ejb.EJB;
import javax.ejb.Singleton;
import javax.ejb.Startup;
import javax.inject.Inject;

@Singleton
@Startup
public class ApplicationBootstrap {

	@Inject
	private Logger log;

	@EJB
	private UserTestdata userTestdata;
	
	@EJB
	private DebugEnvironment debugEnviroment;

	@PostConstruct
	public void insertTestdata() {
		log.info("insert testdata");
		userTestdata.insert();
		debugEnviroment.setup();
	}

}
