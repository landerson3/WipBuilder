import sys, os
sys.path.insert(0,os.path.expanduser('~/'))
from ge_api import ge_api as ge_api
from gx_api import galaxy_api_class as gx_api
from box_api import box_api_class as box_api

# establish the parent folder
PARENT_FOLDER = os.path.expanduser("~/Desktop/_wipbuilding/")
if os.path.exists(PARENT_FOLDER): os.removedirs(PARENT_FOLDER)
os.mkdir(PARENT_FOLDER)

ge = ge_api.ge_api()
assets = ge.get_collection_assets(ge.ret_input_collection)

for asset in assets:
	# download the markup
	preview_image = ge.get_preview_image(asset,1280)
	mark_up_image = ge.get_markup_image(asset)
	mark_up_image.save(os.path.join(f"{PARENT_FOLDER}{asset['name']}"))
	break

# get the asset metadata
# create a dict of name:id for assets
asset_list = {}
for a in assets: asset_list[a['name']]:a['id']
metadata = ge.get_metadata_values([a['id'] for a in assets])
# store the metadata response json as text files
for mres in metadata:
	name = asset_list[mres['assetId']]
	with open(os.path.join({PARENT_FOLDER},name)) as output_file:
		output_file.write(mres)


# download the processed and outline file

# run the wipbuilder

# update the status' in GE to "wip built"

# post wips to WebNative

# update GX paths

# update GX status'