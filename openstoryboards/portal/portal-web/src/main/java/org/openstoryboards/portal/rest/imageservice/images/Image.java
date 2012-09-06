package org.openstoryboards.portal.rest.imageservice.images;

import org.openstoryboards.portal.rest.imageservice.Action;

/**
 * represents manipulations to an Image
 * @author arsenij
 *
 */
public interface Image {
	
	public void apply(Action action);
	public String getImageId();
	public String getPath();
}
