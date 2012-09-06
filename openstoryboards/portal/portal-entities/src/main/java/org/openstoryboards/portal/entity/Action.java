package org.openstoryboards.portal.entity;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.Lob;
import javax.persistence.ManyToOne;

import org.openstoryboards.portal.entity.common.AbstractEntity;
import org.openstoryboards.portal.entity.enums.ActionType;

/**
 * An action is a json representation of a manipulation of the image
 * 
 * @author arsenij
 * 
 */
@Entity
public class Action extends AbstractEntity {

	private static final long serialVersionUID = -5029034530839883826L;
	@Enumerated(EnumType.STRING)
	private ActionType type;
	@Lob 
	@Column(length=1024)
	private String action;
	private Long padVersion;
	@ManyToOne
	private Step step;

	public ActionType getType() {
		return type;
	}

	public void setType(ActionType type) {
		this.type = type;
	}

	public String getAction() {
		return action;
	}

	public void setAction(String action) {
		this.action = action;
	}

	public Long getPadVersion() {
		return padVersion;
	}

	public void setPadVersion(Long padVersion) {
		this.padVersion = padVersion;
	}

	public Step getStep() {
		return step;
	}

	public void setStep(Step step) {
		this.step = step;
	}

}
