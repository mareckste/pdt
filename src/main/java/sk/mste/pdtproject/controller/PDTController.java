package sk.mste.pdtproject.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import sk.mste.pdtproject.model.GeoData;
import sk.mste.pdtproject.model.GeoParams;
import sk.mste.pdtproject.service.PDTService;
import sk.mste.pdtproject.util.Mappings;

import java.util.List;

@Slf4j
@RestController
public class PDTController {

    @Autowired
    PDTService pdtService;

    @GetMapping(Mappings.SEARCH)
    public ResponseEntity<Object> searchAmenities(Model model) {
        log.info("Search called");

        // create testing parameters
        GeoParams geoParams = new GeoParams();
        String [] arr = new String[]{"school", "gym"};
        geoParams.setAmenityTypes(arr);
        geoParams.setLon(-71.057083);
        geoParams.setLat(42.361145);
        geoParams.setMaxRadius(5000000);
        geoParams.setMaxResults(2000);

        List<GeoData> geoData = pdtService.findAmenities(geoParams);

        return new ResponseEntity<Object>(geoData, HttpStatus.OK);
    }
}
