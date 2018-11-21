package sk.mste.pdtproject.util;

public final class QueryTemplates {

    public static final String QUERY_STUDY = new StringBuilder()
            .append("select")
            .append("    p.name,")
            .append("    p.amenity,")
            .append("    st_asgeojson(ST_Transform(p.way, 4326)),")
            .append("    round(")
            .append("            cast(ST_Distance(ST_MakePoint(?, ?)::geography," )
            .append("            ST_Transform(p.way, 4326)::geography) as numeric),")
            .append("            0")
            .append("          ) as distance")
            .append("  from planet_osm_point p")
            .append("  where 1=1 ")
            .append("    and p.amenity = ANY (?) ")
            .append("    and ST_DWithin((ST_MakePoint(?, ?))::geography, ST_Transform(p.way, 4326)::geography, ?)")
            .append("  ORDER BY distance limit ?")
            .toString();

    private QueryTemplates() {}
}
