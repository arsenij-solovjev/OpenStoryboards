package org.openstoryboards.portal.rest.imageservice.images;

import java.awt.image.BufferedImage; 

import javax.ejb.Stateless;
import javax.inject.Inject;

import org.jboss.seam.security.Identity;
import org.openstoryboards.portal.dao.PadDao;
import org.openstoryboards.portal.dao.UserDao;
import org.openstoryboards.portal.entity.Pad;
import org.openstoryboards.portal.entity.User;
import org.openstoryboards.portal.security.CurrentUser;

@Stateless
public class PadFactory {
	
	@Inject 
	private PadDao padDao;
	
	@Inject 
	@CurrentUser
	private User currentUser;
	
	/**
	 * creates new image in the /img folder and returns it's file name, which is randomized
	 * and can be used for access
	 * @return the Image 
	 */
	public Pad make(String title) {
		
		Pad pad = padDao.createPad("");
		pad.setOwner(currentUser);
		padDao.persist(pad);
		return pad;
	}


	/**
	 * creates new image in the /img folder and returns it's file name, which is randomized
	 * and can be used for access
	 * @return the Image 
	 */
	public Pad make() {
		Pad pad = make("");
		return pad;
	}
	
	/**
	 * loads an Image object from a given BufferedImage
	 * @param img
	 * @return image
	 */
	public Image load(BufferedImage img){
		return new ImageImpl(img); 
	}
}
