package org.openstoryboards.portal.entity;

import java.util.ArrayList;
import java.util.List;

import javax.persistence.Entity;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;

import org.openstoryboards.portal.entity.common.AbstractEntity;


/**
 * A step is a unit of actions
 * @author arsenij
 *
 */
@Entity
public class Step extends AbstractEntity{
	
	private static final long serialVersionUID = 1752347554854011586L;
	
	private boolean undone;
	
	@ManyToOne(optional=false)
	private Connection connection;
	
	@ManyToOne
	private Step predecessor;
	
	@OneToMany(mappedBy ="step")
	private List<Action> actions = new ArrayList<Action>();
	
	public Step getPredecessor() {
		return predecessor;
	}
	public void setPredecessor(Step predecessor) {
		this.predecessor = predecessor;
	}
	
	public Connection getConnection() {
		return connection;
	}
	public void setConnection(Connection connection) {
		this.connection = connection;
	}
	public boolean isUndone() {
		return undone;
	}
	public void setUndone(boolean undone) {
		this.undone = undone;
	}
	public List<Action> getActions() {
		return actions;
	}
	public void setActions(List<Action> actions) {
		this.actions = actions;
	}

}
