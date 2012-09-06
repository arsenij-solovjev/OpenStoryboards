package org.openstoryboards.portal.entity;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import javax.persistence.CollectionTable;
import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.JoinTable;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToMany;

import org.openstoryboards.portal.entity.common.AbstractEntity;

/**
 * Contains image data used for managing images
 * 
 * @author arsenij
 * 
 */
@Entity
public class Pad extends AbstractEntity {

	private static final long serialVersionUID = -6632536796337854076L;

	@ManyToMany
	@JoinTable(name = "Pad_Reader",
		joinColumns = @JoinColumn(name = "pad_id"),
		inverseJoinColumns = @JoinColumn(name = "user_id"))
	private Collection<User> readers = new ArrayList<User>();

	@ManyToMany
	@JoinTable(name = "Pad_Writer",
		joinColumns = @JoinColumn(name = "pad_id"),
		inverseJoinColumns = @JoinColumn(name = "user_id"))
	private Collection<User> writers = new ArrayList<User>();

	private int latestVersion = 0;
	
	private String title;

	public void setOwner(User user) {
		readers.add(user);
		writers.add(user);
	}

	public Collection<User> getReaders() {
		return readers;
	}

	public void setReaders(Collection<User> readers) {
		this.readers = readers;
	}

	public Collection<User> getWriters() {
		return writers;
	}

	public void setWriters(Collection<User> writers) {
		this.writers = writers;
	}

	public int getLatestVersion() {
		return latestVersion;
	}

	public void setLatestVersion(int latestVersion) {
		this.latestVersion = latestVersion;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

}
