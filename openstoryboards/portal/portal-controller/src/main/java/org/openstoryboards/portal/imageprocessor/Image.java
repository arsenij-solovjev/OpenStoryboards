package org.openstoryboards.portal.imageprocessor;

import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;

import javax.imageio.ImageIO;

public class Image {
	
	BufferedImage image;
	
	public Image() {
		image = new BufferedImage(1, 1, BufferedImage.TYPE_INT_ARGB);
	}
	
	public boolean load(String filename) {
		image = null;
		try {
		    image = ImageIO.read(new File(filename));
		    return true;
		} catch(IOException e) {
			return false;
		}
	}
}
