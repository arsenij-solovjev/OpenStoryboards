package org.openstoryboards.portal.dao.common;

import java.util.List;

import org.openstoryboards.portal.entity.common.AbstractEntity;

public interface Dao<E extends AbstractEntity> {

	void persist(E instance);

	E find(long id);

	void remove(E instance);

	E merge(E instance);

	List<E> findAll();

}
