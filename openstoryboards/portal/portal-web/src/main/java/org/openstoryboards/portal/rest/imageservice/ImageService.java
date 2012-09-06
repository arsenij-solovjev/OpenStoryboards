package org.openstoryboards.portal.rest.imageservice;

import java.io.File;
import java.util.Collection;
import java.util.logging.Logger;

import javax.ejb.Stateless;
import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.jboss.seam.security.util.Base64;
import org.openstoryboards.portal.dao.ActionDao;
import org.openstoryboards.portal.dao.ConnectionDao;
import org.openstoryboards.portal.dao.PadDao;
import org.openstoryboards.portal.dao.PadHardVersionDao;
import org.openstoryboards.portal.entity.Connection;
import org.openstoryboards.portal.entity.Pad;
import org.openstoryboards.portal.entity.Action;
import org.openstoryboards.portal.entity.PadHardVersion;
import org.openstoryboards.portal.entity.User;
import org.openstoryboards.portal.entity.enums.Right;
import org.openstoryboards.portal.imageprocessor.ImageProcessor;
import org.openstoryboards.portal.imageprocessor.ImageProcessorServer;
import org.openstoryboards.portal.rest.imageservice.images.ImageLookup;
import org.openstoryboards.portal.rest.imageservice.images.PadFactory;


import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonParser;
import com.google.gson.JsonSyntaxException;

@Path("/images")
@Stateless
public class ImageService {

	@Inject
	private PadFactory padFactory;

	@Inject
	private ImageLookup imageLookup;
	
	@Inject
	private Logger log;
	
	@Inject
	private PadDao padDao;
	
	@Inject
	private ConnectionDao connectionDao;

	@Inject
	private PadHardVersionDao padHardVersionDao;

	@Inject
	private ActionDao actionDao;
	
	@Inject
	private ImageProcessorServer processors;
	
	@GET
	@Produces(MediaType.TEXT_PLAIN)
	@Path("/test")
	public String test() {
		return "ImageService is reachable";
	}
	
	/**
	 * creates new pad
	 * @return
	 */
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Path("/create")
	public Response createNewPad() {
		Pad pad = padFactory.make();
		log.info("created new pad with id: " + pad.getId());
		
		return Response.ok(
				new Gson().toJson(pad.getId()), 
				MediaType.APPLICATION_JSON)
				.build();
	}

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Path("/apply")
	public Response apply(
			@QueryParam(value = "accessToken") String accessToken,
			@QueryParam(value = "action") String action) {
		//check connection
		Connection connection = connectionDao.getConnection(accessToken);
		if(connection == null) {
			//TODO find a meaningful message
			return Response.notAcceptable(null).build();
		}
		
		//get pad and user
		Pad pad = connection.getPad();
		User user = connection.getUser();
		
		//check user rights
		if(!padDao.getRightsFor(user, pad).contains(Right.WRITE)) {
			//TODO find a meaningful message
			return Response.notAcceptable(null).build();
		}
		
		//get processor
		ImageProcessor processor = processors.getProcesssor(connection);
		
		//parse action
		action = new String(Base64.decode(action));
		JsonElement json = null;
		try {
			json = (new JsonParser()).parse(action);
		} catch(JsonSyntaxException e) {
			//TODO find a meaningful message
			return Response.notAcceptable(null).build();
		}
		
		//apply action
		JsonElement response = processor.receive(connection, json);
		
		//get image processor
		return Response.ok(new Gson().toJson(response), MediaType.APPLICATION_JSON).build();
	}

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Path("/sync")
	public Response getActionList(
			@QueryParam(value = "accessToken") String accessToken,
			@QueryParam(value = "fromVersion") long fromVersion) {
		//check connection
		Connection connection = connectionDao.getConnection(accessToken);
		if(connection == null) {
			//TODO find a meaningful message
			return Response.notAcceptable(null).build();
		}
		//check user rights
		Pad pad = connection.getPad();
		if(!pad.getReaders().contains(connection.getUser())) {
			//TODO find a meaningful message
			return Response.notAcceptable(null).build();
		}
		//send actions
		Collection<Action> actionList = actionDao.getActionList(pad, fromVersion);
		return Response.ok(
				new Gson().toJson(actionList.toArray()), 
				MediaType.APPLICATION_JSON).build();
	}

	@GET
	@Produces("image/png")
	@Path("/version/{version_id}")
	public Response getHardVersion(
		@PathParam("version_id") long versionId,
		@QueryParam(value = "accessToken") String accessToken) {
		//check connection
		Connection connection = connectionDao.getConnection(accessToken);
		if(connection == null) {
			//TODO find a meaningful message
			return Response.notAcceptable(null).build();
		}
		//check user rights
		Pad pad = connection.getPad();
		if(!pad.getReaders().contains(connection.getUser())) {
			//TODO find a meaningful message
			return Response.notAcceptable(null).build();
		}
		//check version
		PadHardVersion version = padHardVersionDao.getVersion(pad, versionId);
		if(version == null) {
			//TODO find a meaningful message
			return Response.notAcceptable(null).build();
		}
		return Response.ok(new File(version.getPath()), "image/png").build();
	}
}
