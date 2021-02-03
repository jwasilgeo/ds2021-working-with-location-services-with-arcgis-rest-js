<!-- https://svelte.dev/tutorial/await-blocks -->
<script>
  import {
    addFeatures,
    updateFeatures,
    deleteFeatures,
  } from "@esri/arcgis-rest-feature-layer";

  // props to pass in
  export let featureServiceLayerUrl;
  export let featureObject;

  // editable HTML string bound to the <pre> below
  // TODO: should it be reactively bound to featureObject (start the line with `$:` instead of `let`)??
  let editableFeatureHtml = JSON.stringify(featureObject, null, 2);

  // react to user changes in the editable HTML string and update the featureObject variable
  $: if (editableFeatureHtml) {
    try {
      featureObject = JSON.parse(editableFeatureHtml);
      console.log(featureObject);
    } catch (error) {
      console.error(error);
      // revert the HTML string value back to last valid state
      editableFeatureHtml = JSON.stringify(featureObject, null, 2);
    }
  }

  // button disabled state
  let addButtonDisabled = false;
  let updateButtonDisabled = true;
  let deleteButtonDisabled = true;

  async function handleAddClick() {
    const response = await addFeatures({
      url: featureServiceLayerUrl,
      features: [featureObject],
    });

    if (!response.addResults[0].success) {
      // stop early if adding a new feature was not successful
      return;
    }

    // append the objectId of the newly added feature to the attributes of our feature
    // we'll need it when we want to make updates
    // featureObject.attributes.objectId = response.addResults[0].objectId;
    
    // TODO: MAKE THIS EASIER TO COMPREHEND
    const json = JSON.parse(editableFeatureHtml);
    json.attributes.objectId = response.addResults[0].objectId;
    editableFeatureHtml = JSON.stringify(json, null, 2);

    // update button disabled state
    addButtonDisabled = true;
    updateButtonDisabled = false;
  }
  
  async function handleUpdateClick() {
    const response = await updateFeatures({
      url: featureServiceLayerUrl,
      features: [featureObject],
    });
    
    if (!response.updateResults[0].success) {
      // stop early if updating the feature was not successful
      return;
    }
    
    // update button disabled state
    updateButtonDisabled = true;
    deleteButtonDisabled = false;
  }

  async function handleDeleteClick() {
    // delete the feature using the objectId of the updated feature
    const objectIdToDelete = featureObject.attributes.objectId;
    
    const response = await deleteFeatures({
      url: featureServiceLayerUrl,
      objectIds: [objectIdToDelete],
      authentication
    });

    if (!response.deleteResults[0].success) {
      // stop early if deleting the feature was not successful
      return;
    }

    // update button disabled state
    deleteButtonDisabled = true;
  }
</script>

<!-- on:input="{(e) => editableFeatureHtml = JSON.parse(e.target.textContent)}" -->
<pre
  contenteditable="true"
  bind:textContent={editableFeatureHtml}
></pre>

<button on:click={handleAddClick} disabled={addButtonDisabled}>
  &#x1F195; 1. Add new feature
</button>

<button on:click={handleUpdateClick} disabled={updateButtonDisabled}>
  &#x1F4BE; 2. Update it
</button>

<button on:click={handleDeleteClick} disabled={deleteButtonDisabled}>
  &#x1F6AE; 3. Delete it
</button>

<style>
  pre {
    margin: 12px auto;
    padding: 6px;
    border: 2px solid steelblue;
    width: max-content;
    text-align: left;
    font-size: 1.2em;
  }
  button {
    margin: 12px auto;
    display: block;
    font-size: 1.1em;
  }
  [contenteditable] {
		padding: 0.5em;
		border: 1px solid #eee;
		border-radius: 4px;
	}
</style>
