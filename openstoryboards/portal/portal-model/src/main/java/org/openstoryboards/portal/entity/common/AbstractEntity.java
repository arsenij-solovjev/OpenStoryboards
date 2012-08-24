package org.openstoryboards.portal.entity.common;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.MappedSuperclass;
import javax.persistence.Version;

@MappedSuperclass
public abstract class AbstractEntity implements Serializable{

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private long id;

	@Version
	@Column(nullable = false)
	private Long optimisticLockValue;

	public long getId() {
		return id;
	}

	public Long getOptimisticLockValue() {
		return optimisticLockValue;
	}

	public void setOptimisticLockValue(Long optimisticLockValue) {
		this.optimisticLockValue = optimisticLockValue;
	}
	
	@Override
	public int hashCode() {
		return (int) id;
	}
	
	@Override
	public boolean equals(Object obj) {
		if(obj instanceof AbstractEntity && this.getClass()==obj.getClass()) {
			AbstractEntity entity = (AbstractEntity) obj; 
			return this.id == entity.id;
		}
		return super.equals(obj);
	}
}
