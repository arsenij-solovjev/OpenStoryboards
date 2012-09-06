package org.openstoryboards.portal.dao;

import javax.ejb.Local;

import org.openstoryboards.portal.dao.common.Dao;
import org.openstoryboards.portal.entity.Pad;
import org.openstoryboards.portal.entity.PadHardVersion;

@Local
public interface PadHardVersionDao extends Dao<PadHardVersion> {
	/**
	 * returns the lastest version which was saved to hard disk and null if no hard version exists
	 * @param pad
	 * @return
	 */
	PadHardVersion getLastestVersion(Pad pad);

	/**
	 * creates a blank version with corresponding file in the image folder
	 * @param pad
	 * @return 
	 */
	PadHardVersion createBlankVersion(Pad pad);

	/**
	 * returns a hard version with the given version id and null if no hard version with that number exists 
	 * @param versionId
	 * @return
	 */
	PadHardVersion getVersion(Pad pad, long versionId);
}
