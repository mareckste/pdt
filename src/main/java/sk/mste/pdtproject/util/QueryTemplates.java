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
            .append("  order by distance limit ?")
            .toString();

    public static final String QUERY_PARKSHEATMAP = new StringBuilder()
            .append(" select")
            .append("     park_name,")
            .append("     st_asgeojson(ST_Transform(way,4326))")
            .append(" from parks")
            .append(" order by st_asgeojson LIMIT 5000")
            .toString();

    private QueryTemplates() {}
}
