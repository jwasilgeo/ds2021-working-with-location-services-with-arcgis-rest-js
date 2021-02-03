<script>
  import FeatureEditor from "./FeatureEditor.svelte";

  export let name;

  const myEsriFeature = {
    attributes: {
      id: 101,
      name: "editing test",
      rating: "2",
    },
    geometry: {
      x: -118.807,
      y: 34.002,
      spatialReference: {
        wkid: 4326,
      },
    },
  };
</script>

<main>
  <h1>Hello {name}!</h1>
  <p>
    Visit the <a href="https://svelte.dev/tutorial">Svelte tutorial</a> to learn
    how to build Svelte apps.
  </p>

  <hr />

  <FeatureEditor
    featureServiceLayerUrl="https://services3.arcgis.com/GVgbJbqm8hXASVYi/ArcGIS/rest/services/my_points/FeatureServer/0"
    featureObject="{myEsriFeature}"
  />
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
