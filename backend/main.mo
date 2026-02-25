import Storage "blob-storage/Storage";
import Blob "mo:core/Blob";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import MixinStorage "blob-storage/Mixin";

actor {
  include MixinStorage();

  type Plant = {
    id : Text;
    name : Text;
    needs : PlantNeeds;
    photo : Storage.ExternalBlob;
    emotion : PlantEmotion;
  };

  type PlantInput = {
    name : Text;
    photo : Storage.ExternalBlob;
  };

  type NeedStatus = { #good; #needsAttention };

  type PlantNeed = {
    category : NeedCategory;
    status : NeedStatus;
    description : Text;
  };

  type PlantNeeds = [PlantNeed];

  type NeedCategory = {
    #sunlight;
    #soil;
    #water;
    #airQuality;
    #pestPresence;
  };

  type PlantEmotion = {
    #angry;
    #sad;
    #happy;
    #worried;
    #upset;
  };

  var nextId = 0;

  func deterministicHash(blob : Blob, category : NeedCategory) : NeedStatus {
    let size = blob.size();
    switch (category) {
      case (#sunlight) { if (size % 3 == 0) { #needsAttention } else { #good } };
      case (#soil) { if (size % 2 == 0) { #needsAttention } else { #good } };
      case (#water) { if (size % 5 < 2) { #needsAttention } else { #good } };
      case (#airQuality) { if (size % 7 == 1) { #needsAttention } else { #good } };
      case (#pestPresence) { if (size % 11 == 0) { #needsAttention } else { #good } };
    };
  };

  func determineEmotion(blob : Storage.ExternalBlob) : PlantEmotion {
    let seed = blob.size() % 5;
    switch (seed) {
      case (0) { #angry };
      case (1) { #sad };
      case (2) { #happy };
      case (3) { #worried };
      case (4) { #upset };
      case (_) { #happy };
    };
  };

  public shared ({ caller }) func assessPlant(input : PlantInput) : async Plant {
    if (input.name.size() > 50) {
      Runtime.trap("Plant name is too long");
    };

    let categories : [NeedCategory] = [#sunlight, #soil, #water, #airQuality, #pestPresence];

    let needs : PlantNeeds = categories.map(
      func(category) {
        let status = deterministicHash(input.photo, category);
        let description = switch (category) {
          case (#sunlight) {
            switch (status) {
              case (#good) { "Plant is getting enough sunlight." };
              case (#needsAttention) { "Needs more light or repositioning." };
            };
          };
          case (#soil) {
            switch (status) {
              case (#good) { "Soil conditions are optimal." };
              case (#needsAttention) { "May need repotting or nutrient boost." };
            };
          };
          case (#water) {
            switch (status) {
              case (#good) { "Watering routine is adequate." };
              case (#needsAttention) { "Check soil moisture more often." };
            };
          };
          case (#airQuality) {
            switch (status) {
              case (#good) { "Air quality is sufficient." };
              case (#needsAttention) { "Consider ventilation improvements." };
            };
          };
          case (#pestPresence) {
            switch (status) {
              case (#good) { "No pests detected." };
              case (#needsAttention) { "Potential pest risk observed." };
            };
          };
        };

        {
          category;
          status;
          description;
        };
      }
    );

    let emotion = determineEmotion(input.photo);

    {
      id = nextId.toText();
      name = input.name;
      needs;
      photo = input.photo;
      emotion;
    };
  };

  public shared ({ caller }) func uploadPhoto(_blob : Storage.ExternalBlob) : async Storage.ExternalBlob {
    _blob;
  };
};
