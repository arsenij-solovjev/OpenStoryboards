package org.openstoryboards.portal.dao;

import javax.inject.Inject;
import javax.persistence.EntityManager;

import junit.framework.Assert;

import org.junit.Rule;
import org.junit.Test;

import org.openstoryboards.portal.dao.UserDaoBean;
import org.openstoryboards.portal.entity.User;
import org.openstoryboards.portal.testdata.UserTestdataBuilder;

import de.akquinet.jbosscc.needle.annotation.ObjectUnderTest;
import de.akquinet.jbosscc.needle.junit.DatabaseRule;
import de.akquinet.jbosscc.needle.junit.NeedleRule;

public class UserDaoTest {

	@Test
	public void testFindByUsername() throws Exception {
		//TODO
	}

}
