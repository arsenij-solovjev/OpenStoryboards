package org.openstoryboards.portal.rest.imageservice.images;

import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;

import javax.ejb.Stateless;
import javax.imageio.ImageIO;
import javax.inject.Inject;

import org.openstoryboards.portal.dao.PadDao;
import org.openstoryboards.portal.entity.Pad;

/**
 * Load image as wrapped buffered image
 * or file
 * 
 * @author arsenij
 *
 */
@Stateless
public class ImageLookup {
	
	@Inject 
	private PadFactory padFactory;
	
	@Inject
	private PadDao padDao;
	
	public  Image lookupImage(String imageId) {
		// map imageId to filename
		
		String pathToImage = padDao.getLatestVersion(Long.parseLong(imageId));
		
		BufferedImage img = readImage( pathToImage);
		return padFactory.load(img);
	}

	public File lookupFile(String imageId) {
		// map imageId to filename
		String pathToImage = padDao.getLatestVersion(Long.parseLong(imageId));
		File file = new File(pathToImage);
		return file;
	}
	
	private BufferedImage readImage(String imageId) {
		String filename = imageId;
		BufferedImage img = null;
		try {
		    img = ImageIO.read(new File(filename));
		} catch (IOException e) {
			e.printStackTrace();
		}
		return img;
	}
}
