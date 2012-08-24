package org.openstoryboards.portal.rest.imageservice.images;

import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.Serializable;

import javax.ejb.Stateful;
import javax.imageio.ImageIO;
import javax.inject.Inject;

import org.openstoryboards.portal.dao.PadDao;
import org.openstoryboards.portal.entity.Pad;
import org.openstoryboards.portal.rest.imageservice.Action;

@Stateful
public class ImageImpl implements Image,Serializable {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	private static final String DEFAULT_EXTENSION = ".gif";
	private Graphics2D g2;
	private BufferedImage image;
	private File file;
	private long padId;
	private int width;
	private int height;
	
	@Inject 
	private PadDao padDao;
	
	public ImageImpl(){
		
	}
	
	public ImageImpl(int width, int height, long padId, int latestVersion){
		this.width = width;
		this.height = height;
		this.setPadId(padId); 
		initImage(width, height);
		initDefaultGraphics2D();
		createNewFile(padId, latestVersion);
		firstSave();
	}
	
	

	public ImageImpl(BufferedImage img){
		this.image = img;
		initDefaultGraphics2D();
	}

	
	@Override
	public void apply(Action action){
		drawLine(action);		
		save();
	}

	@Override
	public String getImageId() { 
		return file.getName();
	}
	
	@Override
	public String getPath() {
		return file.getAbsolutePath();
	}
	
	//file specific
	
	

	private String getPadDirectory(long padId) {
		String pathToWd = System.getProperty("user.dir");
		File dir =  new File(pathToWd);
		
		String imageDir = dir.getParent() + File.separator;
		imageDir += "standalone" + File.separator;
		imageDir += "images" + File.separator;
		dir = new File(imageDir);
		if(!dir.exists())
			dir.mkdir();
		String padDir = dir.getPath() + File.separator + padId + File.separator;
		dir = new File(padDir);
		if(!dir.exists())
			dir.mkdir();
		return padDir;
	}
	
	
	//image specific
	private void initImage(int width, int height) {
		image = new BufferedImage(width, height, BufferedImage.TYPE_INT_BGR);
	}
	
	private void initDefaultGraphics2D() {
		g2 = image.createGraphics();
		g2.setBackground(Color.WHITE);
		g2.clearRect(0, 0, width, height);
		g2.setColor(Color.BLACK);
	}

	private void drawLine(Action action) {
		//Point from = action.getFrom();
		//Point to = action.getTo();
		//Shape line = new Line2D.Float(from.getX(), from.getY(), to.getX(), to.getY());
		//g2.draw(line);
	}
	
	// image management (io-ish)
	private void save(){
		try {
			// increment file 
			incrementFile();
			ImageIO.write(image, "gif", file);
			
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	
	private void firstSave(){
		try {
			ImageIO.write(image, "gif", file);
			
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	
	private void createNewFile(long padId2, int latestVersion) {
		String dir = getPadDirectory(padId);
		File newFile = new File(dir + latestVersion + DEFAULT_EXTENSION);
		try {
			newFile.createNewFile();
			file = newFile;
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
	}
	
	private void incrementFile() {
		String dir = getPadDirectory(padId);
		Pad pad = padDao.find(padId);
		int latestVersion = pad.getLatestVersion();
		File newFile = new File(dir + latestVersion + DEFAULT_EXTENSION);
		try {
			newFile.createNewFile();
			//pad.addNewVersion(newFile.getPath());
			file = newFile;
			padDao.persist(pad);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	public long getPadId() {
		return padId;
	}

	public void setPadId(long padId) {
		this.padId = padId;
	}

}
