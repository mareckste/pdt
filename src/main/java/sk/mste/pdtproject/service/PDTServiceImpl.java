package sk.mste.pdtproject.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import sk.mste.pdtproject.enumerator.QueryType;
import sk.mste.pdtproject.model.GeoData;
import sk.mste.pdtproject.model.GeoParams;

import java.util.List;

@Slf4j
@Service
public class PDTServiceImpl implements PDTService {

    @Autowired
    private DBAccessor dbAccessor;

    @Override
    public List<GeoData> findAmenities(GeoParams geoParams) {
        return dbAccessor.queryData(geoParams, QueryType.STUDY);
    }
}
