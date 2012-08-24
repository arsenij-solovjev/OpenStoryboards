package org.openstoryboards.portal.dao;

import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

import javax.ejb.Stateless;
import javax.imageio.ImageIO;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;

import org.openstoryboards.portal.dao.common.AbstractDaoBean;
import org.openstoryboards.portal.entity.Connection;
import org.openstoryboards.portal.entity.Pad;
import org.openstoryboards.portal.entity.PadHardVersion;
import org.openstoryboards.portal.entity.PadHardVersion_;
import org.openstoryboards.portal.entity.enums.Right;
import org.openstoryboards.portal.entity.User;

@Stateless
public class PadHardVersionDaoBean extends AbstractDaoBean<PadHardVersion> implements PadHardVersionDao, Serializable {
 
	private static final long serialVersionUID = -644473332892769499L;

	private final static int DEFAULT_WIDTH = 600;
	private final static int DEFAULT_HEIGHT = 400;
	
	@Override
	public PadHardVersion getLastestVersion(Pad pad) {
		CriteriaBuilder builder = getCriteriaBuilder();
		CriteriaQuery<PadHardVersion> query = builder.createQuery(PadHardVersion.class);
		Root<PadHardVersion> version = query.from(PadHardVersion.class);
		query.where(
			builder.equal(version.get(PadHardVersion_.pad), pad)
		);
		query.orderBy(builder.asc(version.get(PadHardVersion_.version)));
		return getSingleResult(query);
	}
	
	@Override
	public PadHardVersion createBlankVersion(Pad pad) {
		//TODO refactoring?
		//create image
		String filename = "0.png";
		String path = getPadDirectory(pad.getId());
		String wholePath = path+filename;
		BufferedImage image = new BufferedImage(DEFAULT_WIDTH, DEFAULT_HEIGHT, BufferedImage.TYPE_INT_BGR);
		
		//draw image
		Graphics2D g2 = image.createGraphics();
		g2.setBackground(Color.WHITE);
		g2.clearRect(0, 0, DEFAULT_WIDTH, DEFAULT_HEIGHT);
		
		//save image
		try {
			File file = new File(wholePath);
			ImageIO.write(image, "png", file);
		} catch (FileNotFoundException e) {
			e.printStackTrace();
			return null;
		} catch (IOException e) {
			e.printStackTrace();
			return null;
		}
		
		//save hard version record
		PadHardVersion version = new PadHardVersion();
		version.setPad(pad);
		version.setVersion(0);
		version.setPath(wholePath);
		persist(version);
		return version;
	}

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

	@Override
	public PadHardVersion getVersion(Pad pad, long versionId) {
		CriteriaBuilder builder = getCriteriaBuilder();
		CriteriaQuery<PadHardVersion> query = builder.createQuery(PadHardVersion.class);
		Root<PadHardVersion> version = query.from(PadHardVersion.class);
		query.where(
			builder.and(
				builder.equal(version.get(PadHardVersion_.pad), pad),
				builder.equal(version.get(PadHardVersion_.version), versionId)
			)
		);
		return getSingleResult(query);
	}
}
