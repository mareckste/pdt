package sk.mste.pdtproject.service;

import sk.mste.pdtproject.enumerator.QueryType;
import sk.mste.pdtproject.model.PDTFilter;

public interface DBAccessor {

    String queryData(PDTFilter PDTFilter, QueryType queryType);

}
