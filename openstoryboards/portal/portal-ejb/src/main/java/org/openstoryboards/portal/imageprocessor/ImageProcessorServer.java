package org.openstoryboards.portal.imageprocessor;

import java.util.HashMap; 
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import javax.ejb.Lock;
import javax.ejb.LockType;
import javax.ejb.Singleton;
import javax.ejb.Startup;
import javax.ejb.Stateless;
import javax.enterprise.context.spi.CreationalContext;
import javax.enterprise.inject.spi.Bean;
import javax.enterprise.inject.spi.BeanManager;
import javax.inject.Inject;
import javax.naming.InitialContext;
import javax.naming.NamingException;

import org.openstoryboards.portal.dao.ActionDao;
import org.openstoryboards.portal.dao.PadHardVersionDao;
import org.openstoryboards.portal.entity.Connection;
import org.openstoryboards.portal.entity.Pad;

/**
 * a central component that serves image processors for a certain pad
 * @author Markus
 */
@Singleton
@Startup
public class ImageProcessorServer {
	private static BeanManager getBeanManager() {
		try {
			InitialContext initialContext = new InitialContext();
			return (BeanManager) initialContext.lookup("java:comp/BeanManager");
		} catch (NamingException e) {
			return null;
		}
	}
	
	@SuppressWarnings("unchecked")
	public static ImageProcessor createImageProcessor() {
		BeanManager bm = getBeanManager();
		Bean<ImageProcessor> bean = (Bean<ImageProcessor>) bm.getBeans(ImageProcessor.class).iterator().next();
		CreationalContext<ImageProcessor> ctx = bm.createCreationalContext(bean);
	    ImageProcessor ip = (ImageProcessor) bm.getReference(bean, ImageProcessor.class, ctx);
	    return ip;
	}
	
	private static class PadData {
		private ImageProcessor processor;
		private Set<Long> connections = new HashSet<Long>();
		public PadData(Pad pad) {
			processor = createImageProcessor();
			processor.load(pad);
		}
		public ImageProcessor getProcessor() {
			return processor;
		}
		public Set<Long> getConnections() {
			return connections;
		}
	}
	
	private Map<Long, PadData> pads = new HashMap<Long, PadData>(); 
	
	@Lock(LockType.WRITE)
	public boolean login(Connection connection) {
		PadData pd = new PadData(connection.getPad());
		pd.getConnections().add(connection.getId());
		pads.put(connection.getPad().getId(), pd);
		return true;
	}
	
	@Lock(LockType.WRITE)
	public void logout(Connection connection) {
		PadData pd = pads.get(connection.getPad().getId());
		Set<Long> connections = pd.getConnections();
		connections.remove(connection.getId());
		if(connections.size()==0)
			pads.remove(connection.getPad().getId());
	}
	
	@Lock(LockType.READ)
	public ImageProcessor getProcesssor(Connection connection) {
		return pads.get(connection.getPad().getId()).getProcessor();
	}
}