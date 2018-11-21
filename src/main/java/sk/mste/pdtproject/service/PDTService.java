package sk.mste.pdtproject.service;

import sk.mste.pdtproject.model.GeoData;
import sk.mste.pdtproject.model.GeoParams;

import java.util.List;

public interface PDTService {

    public List<GeoData> findAmenities(GeoParams geoParams);

}
