describe("Basemap adder dialog", function() {
  var basemap_dialog, table, server, base_layers;

  beforeEach(function() {
    table = TestUtil.createTable('test');

    base_layers = new Backbone.Collection({ url:'/test' });

    basemap_dialog = new cdb.admin.BaseMapAdder({
      model: this.model,
      baseLayers: base_layers,
      ok: function(layer) {}
    });
    server = sinon.fakeServer.create();
  });

  it("should open the basemap chooser dialog", function() {
    basemap_dialog.render();
    expect(basemap_dialog.$el.find(".modal:eq(0) div.head h3").text()).toEqual('Add your basemap');
    expect(basemap_dialog.$el.find("input").length).toEqual(1);
  });

  it("should fix https url", function() {
    var url = cdb.admin.BaseMapAdder.prototype._fixHTTPS('http://test.com/1.json', { protocol: 'https:' });
    expect(url).toEqual('https://test.com/1.json');

    url = cdb.admin.BaseMapAdder.prototype._fixHTTPS('http://test.com/1.json', { protocol: 'http:' });
    expect(url).toEqual('http://test.com/1.json');
  });

  // it("should use mapbox https url", function() {
  //   var url = cdb.admin.BaseMapAdder.prototype._fixHTTPS(
  //     'http://a.tiles.mapbox.com/v3/examples.map-4l7djmvo.json',
  //     { protocol: 'https:' }
  //   );

  //   expect(url).toEqual('https://dnv9my2eseobd.cloudfront.net/v3/examples.map-4l7djmvo.json');

  //   url = cdb.admin.BaseMapAdder.prototype._fixHTTPS(
  //     'http://a.tiles.mapbox.com/v3/examples.map-4l7djmvo.json',
  //     { protocol: 'http:' }
  //   );
  //   expect(url).toEqual(
  //     'http://a.tiles.mapbox.com/v3/examples.map-4l7djmvo.json'
  //   )
  // });
  
  // Edit url has changed and a new test has been added
  // it("should transform public mapbox urls to the correct ones", function() {
  //   var url = cdb.admin.BaseMapAdder.prototype.transformMapboxUrl.call(this, "http://tiles.mapbox.com/cartodb/map/map-02i0no2h")
  //   expect(url).toEqual('http://tiles.mapbox.com/v3/cartodb.map-02i0no2h/{z}/{x}/{y}.png')
  // })

  // it("should show an error if the tilejson doesn't exist", function() {
  //   basemap_dialog.render();
  //   spyOn(basemap_dialog, '_errorChooser');
  //   basemap_dialog.$("input").val("http://a.tiles.mapbox.com/v3/cartodb.map-uulyudas-jamon-error.jsonp");
  //   basemap_dialog._checkTileJson();
  //   expect(basemap_dialog._errorChooser).not.toHaveBeenCalled();
  // });

  it("should show an error if the xyz tile doesn't exist", function() {
    basemap_dialog.render();
    spyOn(basemap_dialog, '_errorChooser');
    basemap_dialog.$el.find("input").val("http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{Z}/{y}/{X}/error");
    basemap_dialog._checkTileJson();
    expect(basemap_dialog._errorChooser).not.toHaveBeenCalled();
  });

  // it("should send mapbox url if user provides a mapbox id", function() {
  //   basemap_dialog.render();
  //   spyOn(basemap_dialog, '_hideLoader');
  //   basemap_dialog.$("input").val("saleiva.map-73mv164v");
  //   basemap_dialog.$(".ok").click();
  //   var server = sinon.fakeServer.create();
  //   server.respondWith('http://a.tiles.mapbox.com/v3/saleiva.map-73mv164v/0/0/0.png', [200, { "Content-Type": "application/json" }, '{}']);
  //   server.respond();
  //   expect(basemap_dialog._hideLoader).toHaveBeenCalled();
  // });

  it("should send mapbox url if user provides the mapbox edit url", function() {
    basemap_dialog.render();
    spyOn(basemap_dialog, '_successChooser');
    basemap_dialog.$("input").val("https://tiles.mapbox.com/saleiva/edit/map-73mv164v#3/0.09/0.00");
    basemap_dialog._checkTileJson();
    expect(basemap_dialog._successChooser).toHaveBeenCalledWith({ tiles: ['http://a.tiles.mapbox.com/v3/saleiva.map-73mv164v/{z}/{x}/{y}.png'] });
  });

  it("should send mapbox url if user provides the embed url", function() {
    basemap_dialog.render();
    spyOn(basemap_dialog, '_successChooser');
    basemap_dialog.$("input").val("http://a.tiles.mapbox.com/v3/saleiva.map-73mv164v/page.html");
    basemap_dialog._checkTileJson();
    expect(basemap_dialog._successChooser).toHaveBeenCalledWith({ tiles: ['http://a.tiles.mapbox.com/v3/saleiva.map-73mv164v/{z}/{x}/{y}.png'] });
  });

  it("should send mapbox url if user provides the mapbox xyz url", function() {
    basemap_dialog.render();
    spyOn(basemap_dialog, '_successChooser');
    basemap_dialog.$("input").val("http://d.tiles.mapbox.com/v3/saleiva.map-73mv164v/{z}/{y}/{z}.png");
    basemap_dialog._checkTileJson();
    expect(basemap_dialog._successChooser).toHaveBeenCalledWith({ tiles: ['http://a.tiles.mapbox.com/v3/saleiva.map-73mv164v/{z}/{x}/{y}.png'] });
  });

  // it("should return a new layer when add a correct tilejson url", function() {
  //   basemap_dialog.render();

  //   // Sinon can catch JSONP requests due to the fact that
  //   // a script is added to the document

  //   spyOn(jQuery, 'ajax');
  //   basemap_dialog.$el.find("input").val("http://a.tiles.mapbox.com/v3/cartodb.map-uulyudas.jsonp");
  //   basemap_dialog._checkTileJson();

  //   expect(jQuery.ajax).toHaveBeenCalled();
  // });

  it("should return a new layer when add a correct image xyz url", function() {
    var url = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}";
    basemap_dialog.render();

    cdb.admin.TileLayer = cdb.admin.TileLayer.extend({ url: '/test' })

    spyOn(basemap_dialog, 'hide');
    basemap_dialog.$el.find("input").val(url);
    basemap_dialog._successChooser({ tiles: [url] });
    expect(basemap_dialog.options.baseLayers.size()).toBe(2);
    expect(basemap_dialog.hide).toHaveBeenCalled();
  });

  it("should return a new layer when add a correct image xyz url without https", function() {
    var url = "http://c.tile.stamen.com/watercolor/{Z}/{X}/{Y}.jpg";
    basemap_dialog.render();

    cdb.admin.TileLayer = cdb.admin.TileLayer.extend({ url: '/test' })

    spyOn(basemap_dialog, 'hide');
    basemap_dialog.$el.find("input").val(url);
    basemap_dialog._successChooser({ tiles: [url] });
    expect(basemap_dialog.options.baseLayers.size()).toBe(2);
    expect(basemap_dialog.hide).toHaveBeenCalled();
  });

});
