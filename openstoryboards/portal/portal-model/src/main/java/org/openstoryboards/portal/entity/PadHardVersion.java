package org.openstoryboards.portal.entity;

import java.util.ArrayList;
import java.util.Collection;

import javax.persistence.Entity;
import javax.persistence.JoinTable;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;

import org.openstoryboards.portal.entity.common.AbstractEntity;

import org.openstoryboards.portal.entity.Action;

/**
 * A pad hard version represents a pad snapshot physically saved on hard disk
 * @author Markus
 */
@Entity
public class PadHardVersion extends AbstractEntity {
  
	private static final long serialVersionUID = 1L;
	
	@ManyToOne
	private Pad pad;
    private long version;
    private String path;

    @OneToMany
    @JoinTable(name="padHardVerionActionSettings", 
          joinColumns=@JoinColumn(name="padHardVersion_id"),
          inverseJoinColumns=@JoinColumn(name="action_id"))
    private Collection<Action> actionSettings = new ArrayList<Action>();
    
	public Pad getPad() {
		return pad;
	}
	public void setPad(Pad pad) {
		this.pad = pad;
	}
	public String getPath() {
		return path;
	}
	public void setPath(String path) {
		this.path = path;
	}
	public long getVersion() {
		return version;
	}
	public void setVersion(long version) {
		this.version = version;
	}
	public Collection<Action> getActionSettings() {
		return actionSettings;
	}
	public void setActionSettings(Collection<Action> actionSettings) {
		this.actionSettings = actionSettings;
	}
}
