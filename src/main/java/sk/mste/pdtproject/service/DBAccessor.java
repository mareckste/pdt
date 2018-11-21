package sk.mste.pdtproject.service;

import sk.mste.pdtproject.enumerator.QueryType;
import sk.mste.pdtproject.model.GeoData;
import sk.mste.pdtproject.model.GeoParams;

import java.util.List;

public interface DBAccessor {

    List<GeoData> queryData(GeoParams geoParams, QueryType queryType);

}
